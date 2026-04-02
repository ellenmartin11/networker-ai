import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UploadCloud, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import Papa from "papaparse";

import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";

interface ImportContactsDialogProps {
    onContactsImported: () => void;
}

export function ImportContactsDialog({ onContactsImported }: ImportContactsDialogProps) {
    const [open, setOpen] = useState(false);
    const [importing, setImporting] = useState(false);
    const { toast } = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setImporting(true);

        Papa.parse(file, {
            skipEmptyLines: 'greedy',
            complete: async (results) => {
                try {
                    // LinkedIn CSVs often have several lines of notes before the actual headers.
                    // We need to find the row that contains our expected headers.
                    const rows = results.data as string[][];
                    let headerIndex = 0;

                    for (let i = 0; i < Math.min(10, rows.length); i++) {
                        const rowStr = rows[i].join(" ").toLowerCase();
                        if (rowStr.includes("first name") || rowStr.includes("last name")) {
                            headerIndex = i;
                            break;
                        }
                    }

                    const headers = rows[headerIndex];
                    const dataRows = rows.slice(headerIndex + 1);

                    // Create a mapping of header name to index
                    const headerMap: Record<string, number> = {};
                    headers.forEach((h, i) => {
                        headerMap[h.trim()] = i;
                    });

                    // Format into Supabase inserts
                    const allInserts = dataRows.map((row) => {
                        const getVal = (key: string) => row[headerMap[key]]?.trim() || "";

                        const firstName = getVal("First Name");
                        const lastName = getVal("Last Name");
                        const fullName = `${firstName} ${lastName}`.trim();
                        const email = getVal("Email Address");
                        const company = getVal("Company");
                        const position = getVal("Position");
                        const url = getVal("URL");
                        
                        // New Optional Columns
                        const bioCol = getVal("Bio");
                        const interestsCol = getVal("Interests");
                        const locationCol = getVal("Location");

                        // If there is absolutely no name or company, we probably hit a junk row at the end
                        if (!firstName && !lastName && !company) return null;

                        // Compose bio from custom column and Email if present
                        let bioStr = bioCol ? bioCol + "\n" : "";
                        if (email) {
                            bioStr += `Email: ${email}\n`;
                        }

                        // Parse optional comma-separated interests into the skills array
                        const skillsArray = interestsCol ? interestsCol.split(',').map(s => s.trim()).filter(Boolean) : [];

                        return {
                            name: fullName || "Unknown Contact",
                            linkedin_url: url || null,
                            company: company || null,
                            companies: company ? [company] : [],
                            headline: position || null,
                            bio: bioStr.trim() || null,
                            location: locationCol || null,
                            skills: skillsArray
                        };
                    }).filter(Boolean); // remove nulls

                    if (allInserts.length === 0) {
                        toast({ title: "No contacts found", description: "The CSV appears to be empty.", variant: "destructive" });
                        return;
                    }

                    // Enforce 50 contact limit
                    const inserts = allInserts.slice(0, 50);

                    const { error } = await supabase.from("contacts").insert(inserts);
                    if (error) throw error;

                    toast({ title: "Import successful!", description: `Added ${inserts.length} contacts.` });
                    setOpen(false);
                    onContactsImported();
                } catch (e) {
                    console.error(e);
                    toast({ title: "Import failed", description: "Could not import contacts. Please verify the CSV format.", variant: "destructive" });
                } finally {
                    setImporting(false);
                    if (fileInputRef.current) fileInputRef.current.value = ""; // reset input
                }
            },
            error: (error) => {
                console.error("CSV Parse Error:", error);
                toast({ title: "Parse failed", description: "Failed to read the CSV file.", variant: "destructive" });
                setImporting(false);
                if (fileInputRef.current) fileInputRef.current.value = "";
            }
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="gap-2 bg-card border-border hover:bg-muted">
                    <UploadCloud className="h-4 w-4" />
                    Import CSV
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md bg-card border-border">
                <DialogHeader>
                    <DialogTitle className="font-display text-xl">Import Contacts via CSV</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="text-sm text-muted-foreground space-y-2">
                        <p>Upload a CSV file (e.g., LinkedIn Connections export) to bulk add contacts.</p>
                        
                        <Accordion type="single" collapsible className="w-full">
                            <AccordionItem value="item-1" className="border-0">
                                <AccordionTrigger className="py-2 text-sm font-medium text-primary hover:no-underline">
                                    How to export your LinkedIn data?
                                </AccordionTrigger>
                                <AccordionContent className="pb-4 text-sm text-muted-foreground">
                                    <ol className="list-decimal pl-4 space-y-1">
                                        <li>Go to LinkedIn <strong>Settings & Privacy</strong></li>
                                        <li>Click <strong>Data privacy</strong> on the left menu</li>
                                        <li>Select <strong>Get a copy of your data</strong></li>
                                        <li>Check <strong>Connections</strong> and request the archive</li>
                                    </ol>
                                    <p className="text-xs text-amber-600 dark:text-amber-500 italic mt-3 font-medium bg-amber-50 dark:bg-amber-950/50 inline-block px-2 py-1 rounded">
                                        *Note: LinkedIn can take up to a few days to email you this spreadsheet.
                                    </p>
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>

                        <p>Expected columns include: First Name, Last Name, URL, Email Address, Company, Position. <br/><span className="italic text-primary/70">(Optional: Bio, Interests, Location)</span></p>
                        <p className="font-semibold text-primary/80 mt-2">
                            * Note: On the free tier, we will add only 50 contacts.
                        </p>
                        <p className="text-xs text-amber-600 dark:text-amber-500 mt-2 bg-amber-50 dark:bg-amber-950/50 p-2.5 rounded-md border border-amber-200 dark:border-amber-900/50 leading-relaxed">
                            * Note: Some information will be missing due to LinkedIn's privacy act. The ALERT icon indicates which contacts have missing information. We recommend filling this in to enhance AI functionality, though it is not necessary.
                        </p>
                    </div>
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="csv-upload" className="sr-only">Upload CSV</Label>
                        <div className="flex items-center gap-2">
                            <Input
                                id="csv-upload"
                                type="file"
                                accept=".csv"
                                onChange={handleImport}
                                disabled={importing}
                                ref={fileInputRef}
                                className="bg-muted border-border cursor-pointer file:text-foreground file:bg-primary/10 file:border-0 file:rounded-sm file:px-2 hover:file:bg-primary/20"
                            />
                        </div>
                    </div>
                    {importing && (
                        <div className="flex items-center justify-center text-sm text-muted-foreground gap-2 pt-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Processing file...
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}

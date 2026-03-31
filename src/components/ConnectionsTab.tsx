import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, UserPlus, Check, X, Clock, Users } from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

interface Profile {
  id: string;
  name: string | null;
  headline: string | null;
}

interface Connection {
  id: string;
  requester_id: string;
  target_id: string;
  status: string;
  requester_shares_contacts: boolean;
  target_shares_contacts: boolean;
  profiles?: Profile; // Joins might populate this manually if we fetch correctly
  other_profile?: Profile;
}

export function ConnectionsTab() {
  const { user } = useAuth();
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Profile[]>([]);
  const [searching, setSearching] = useState(false);

  // Privacy Policy state
  const [showPrivacyDialog, setShowPrivacyDialog] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [pendingShareConnection, setPendingShareConnection] = useState<Connection | null>(null);
  const [hasAgreedToPrivacy, setHasAgreedToPrivacy] = useState(() => localStorage.getItem("networker_privacy_agreed") === "true");

  // Fetch connections and the related profiles
  const fetchConnections = async () => {
    if (!user) return;
    setLoading(true);
    
    // Fetch connections where user is requester or target
    const { data: connData, error: connError } = await supabase
      .from('user_connections')
      .select('*')
      .or(`requester_id.eq.${user.id},target_id.eq.${user.id}`);
      
    if (connError) {
      console.error(connError);
      setLoading(false);
      return;
    }

    if (!connData || connData.length === 0) {
      setConnections([]);
      setLoading(false);
      return;
    }

    // Now manually fetch the other profiles since PostgREST join on multiple foreign keys to same table can be tricky
    const otherUserIds = connData.map(c => c.requester_id === user.id ? c.target_id : c.requester_id);
    
    const { data: profilesData } = await supabase
      .from('profiles')
      .select('id, name, headline')
      .in('id', otherUserIds);

    const enrichedConnections = connData.map(c => {
      const otherId = c.requester_id === user.id ? c.target_id : c.requester_id;
      const otherProfile = profilesData?.find(p => p.id === otherId);
      return { ...c, other_profile: otherProfile };
    });

    setConnections(enrichedConnections);
    setLoading(false);
  };

  useEffect(() => {
    fetchConnections();
  }, [user]);

  const searchUsers = async () => {
    if (!searchQuery.trim() || !user) return;
    setSearching(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('id, name, headline')
      .ilike('name', `%${searchQuery}%`)
      .neq('id', user.id)
      .limit(10);
      
    if (error) {
      toast.error("Failed to search users");
    } else {
      setSearchResults(data || []);
    }
    setSearching(false);
  };

  const sendRequest = async (targetId: string) => {
    if (!user) return;
    try {
      const { error } = await supabase
        .from('user_connections')
        .insert({
          requester_id: user.id,
          target_id: targetId,
          status: 'pending'
        });
        
      if (error) throw error;
      toast.success("Connection request sent!");
      setSearchQuery("");
      setSearchResults([]);
      fetchConnections();
    } catch (e: any) {
      toast.error(e.message || "Failed to send request");
    }
  };

  const respondToRequest = async (connectionId: string, status: 'accepted' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('user_connections')
        .update({ status })
        .eq('id', connectionId);
        
      if (error) throw error;
      toast.success(status === 'accepted' ? "Connection accepted!" : "Connection rejected.");
      fetchConnections();
    } catch (e: any) {
      toast.error(e.message || "Failed to update connection");
    }
  };

  const handleToggleAttempt = (connection: Connection) => {
    if (!user) return;
    const isRequester = connection.requester_id === user.id;
    const currentStatus = isRequester ? connection.requester_shares_contacts : connection.target_shares_contacts;
    const newStatus = !currentStatus;

    if (newStatus && !hasAgreedToPrivacy) {
      setPendingShareConnection(connection);
      setPrivacyAccepted(false);
      setShowPrivacyDialog(true);
    } else {
      toggleShareContacts(connection, newStatus);
    }
  };

  const confirmPrivacyAndShare = () => {
    if (!privacyAccepted) return;
    localStorage.setItem("networker_privacy_agreed", "true");
    setHasAgreedToPrivacy(true);
    setShowPrivacyDialog(false);
    if (pendingShareConnection) {
      toggleShareContacts(pendingShareConnection, true);
      setPendingShareConnection(null);
    }
  };

  const toggleShareContacts = async (connection: Connection, newStatus: boolean) => {
    if (!user) return;
    const isRequester = connection.requester_id === user.id;
    
    try {
      const { error } = await supabase
        .from('user_connections')
        .update(isRequester ? { requester_shares_contacts: newStatus } : { target_shares_contacts: newStatus })
        .eq('id', connection.id);
        
      if (error) throw error;
      toast.success(newStatus ? "You are now sharing contacts." : "You stopped sharing contacts.");
      fetchConnections();
    } catch (e: any) {
      toast.error("Failed to update sharing preferences");
    }
  };

  const pendingIncoming = connections.filter(c => c.status === 'pending' && c.target_id === user?.id);
  const pendingOutgoing = connections.filter(c => c.status === 'pending' && c.requester_id === user?.id);
  const accepted = connections.filter(c => c.status === 'accepted');

  return (
    <div className="space-y-6">
      {/* Search Section */}
      <div className="bg-white/60 backdrop-blur-xl border border-white/40 shadow-sm rounded-lg p-5 space-y-4">
        <div>
          <h3 className="text-lg font-medium text-primary flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Discover Connections
          </h3>
          <p className="text-sm text-muted-foreground mt-1">Search for other networker-ai users by name to connect and share contacts.</p>
        </div>
        
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && searchUsers()}
              className="pl-9 bg-white/60 backdrop-blur-md"
            />
          </div>
          <Button onClick={searchUsers} disabled={searching} variant="secondary">
            {searching ? "Searching..." : "Search"}
          </Button>
        </div>

        {searchResults.length > 0 && (
          <div className="pt-2 space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">Results</h4>
            {searchResults.map(p => {
              // Check if already connected/pending
              const existingConn = connections.find(c => c.requester_id === p.id || c.target_id === p.id);
              return (
                <div key={p.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-md bg-white/40 border border-white/40 shadow-sm gap-3">
                  <div>
                    <div className="font-medium text-sm">{p.name || 'Unknown User'}</div>
                    <div className="text-xs text-muted-foreground line-clamp-1">{p.headline || 'No headline'}</div>
                  </div>
                  <Button 
                    size="sm" 
                    onClick={() => sendRequest(p.id)}
                    disabled={!!existingConn}
                    variant={existingConn ? "outline" : "default"}
                  >
                    {existingConn ? "Request Pending/Connected" : "Connect"}
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-20 rounded-lg" />)}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Incoming Requests */}
          {pendingIncoming.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-md font-medium text-primary flex items-center gap-2">
                <Users className="h-4 w-4" />
                Connection Requests
                <Badge variant="default" className="ml-1">{pendingIncoming.length}</Badge>
              </h3>
              {pendingIncoming.map(conn => (
                <Card key={conn.id} className="bg-white/60 backdrop-blur-md border-white/40 shadow-sm">
                  <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="font-medium text-foreground">{conn.other_profile?.name || 'Unknown User'}</div>
                      <div className="text-sm text-foreground/70">{conn.other_profile?.headline}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" onClick={() => respondToRequest(conn.id, 'accepted')} className="gap-1 bg-green-600 hover:bg-green-700">
                        <Check className="h-4 w-4" /> Accept
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => respondToRequest(conn.id, 'rejected')} className="gap-1">
                        <X className="h-4 w-4" /> Reject
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Accepted Connections */}
          {accepted.length > 0 ? (
            <div className="space-y-3">
              <h3 className="text-md font-medium text-primary flex items-center gap-2">
                <Users className="h-4 w-4" />
                My Connections
              </h3>
              {accepted.map(conn => {
                const isRequester = conn.requester_id === user?.id;
                const iShare = isRequester ? conn.requester_shares_contacts : conn.target_shares_contacts;
                const theyShare = isRequester ? conn.target_shares_contacts : conn.requester_shares_contacts;

                return (
                  <Card key={conn.id} className="bg-white/60 backdrop-blur-md border-white/40 shadow-sm">
                    <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <div className="font-medium text-foreground">{conn.other_profile?.name || 'Unknown User'}</div>
                        <div className="text-sm text-foreground/70 mb-2">{conn.other_profile?.headline}</div>
                        <div className="flex items-center gap-2">
                          <Badge variant={theyShare ? "default" : "secondary"} className="text-[10px] px-1.5 py-0 font-medium tracking-wide">
                            {theyShare ? "They are sharing contacts" : "Not sharing contacts"}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="flex flex-col sm:items-end gap-2 bg-white/40 p-3 rounded-md border border-white/20">
                        <Label htmlFor={`share-${conn.id}`} className="text-xs text-muted-foreground flex items-center gap-2 font-medium cursor-pointer">
                          Share my NetGraph with this connection
                        </Label>
                        <Switch
                          id={`share-${conn.id}`}
                          checked={iShare}
                          onCheckedChange={() => handleToggleAttempt(conn)}
                          className="data-[state=checked]:bg-primary"
                        />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="bg-white/40 p-8 rounded-lg border border-white/20 text-center space-y-2 text-muted-foreground flex flex-col items-center">
              <Users className="h-10 w-10 text-muted-foreground/30" />
              <p>You don't have any connections yet.</p>
              <p className="text-xs">Search for users above to start building your network on networker-ai.</p>
            </div>
          )}

          {/* Pending Outgoing */}
          {pendingOutgoing.length > 0 && (
            <div className="space-y-3 opacity-70">
              <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Sent Requests
              </h3>
              {pendingOutgoing.map(conn => (
                <div key={conn.id} className="flex justify-between items-center p-3 rounded-md bg-white/30 border border-white/20 text-sm">
                  <span>{conn.other_profile?.name || 'Unknown User'}</span>
                  <Badge variant="outline" className="text-xs">Pending</Badge>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Privacy Policy Dialog */}
      <Dialog open={showPrivacyDialog} onOpenChange={setShowPrivacyDialog}>
        <DialogContent className="sm:max-w-md bg-white/95 backdrop-blur-xl border-white/40 shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-xl text-primary flex justify-center mt-2 mb-2">Terms & Privacy Policy</DialogTitle>
            <DialogDescription className="text-center text-slate-600 space-y-4">
              <p>
                By ticking this box, you agree to share your extended network with this contact, allowing them to perform AI Similarity Searches and find mutual matches.
              </p>
              <div className="bg-primary/5 p-4 rounded-lg border border-primary/20 text-sm text-slate-700 text-left">
                <strong>Privacy Commitment:</strong>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li>No emails, phone numbers, or private contact information will be shared.</li>
                  <li>Only public details like names, headlines, skills, and LinkedIn profile URLs are accessible.</li>
                  <li>You can stop sharing your contacts at any time.</li>
                </ul>
              </div>
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center space-x-2 my-4">
            <Checkbox 
              id="privacy-agree" 
              checked={privacyAccepted}
              onCheckedChange={(checked) => setPrivacyAccepted(checked === true)}
            />
            <label
              htmlFor="privacy-agree"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-slate-700 cursor-pointer"
            >
              I agree to the Terms & Privacy Policy.
            </label>
          </div>
          <DialogFooter className="sm:justify-end gap-2 sm:gap-0 mt-2">
            <Button variant="outline" onClick={() => setShowPrivacyDialog(false)} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button 
              onClick={confirmPrivacyAndShare} 
              disabled={!privacyAccepted}
              className="w-full sm:w-auto bg-primary hover:bg-primary/90"
            >
              Agree & Share
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

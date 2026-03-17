import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

async function queryNeo4j(query: string, params: Record<string, unknown> = {}) {
  const NEO4J_URI = Deno.env.get("NEO4J_URI");
  const NEO4J_USERNAME = Deno.env.get("NEO4J_USERNAME");
  const NEO4J_PASSWORD = Deno.env.get("NEO4J_PASSWORD");

  if (!NEO4J_URI || !NEO4J_USERNAME || !NEO4J_PASSWORD) {
    throw new Error("Neo4j credentials not configured");
  }

  // Convert bolt:// to https:// for HTTP API
  const httpUri = NEO4J_URI.replace("neo4j+s://", "https://").replace("neo4j://", "http://").replace("bolt+s://", "https://").replace("bolt://", "http://");
  const txUrl = `${httpUri}/db/neo4j/tx/commit`;

  const response = await fetch(txUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Basic " + btoa(`${NEO4J_USERNAME}:${NEO4J_PASSWORD}`),
    },
    body: JSON.stringify({
      statements: [{ statement: query, parameters: params }],
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    console.error("Neo4j HTTP error:", response.status, text);
    throw new Error(`Neo4j error: ${response.status}`);
  }

  const result = await response.json();
  if (result.errors?.length) {
    console.error("Neo4j query errors:", result.errors);
    throw new Error(result.errors[0].message);
  }

  return result.results[0];
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const {
      top_n = 5,
      user_bio = "",
      user_location = "",
      user_affiliations = "",
      user_tags = "",
      match_preference = "all"
    } = await req.json();

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY not configured");

    // Get all contacts from Supabase
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: contacts, error: dbErr } = await supabase
      .from("contacts")
      .select("*")
      .neq("priority", -1)
      .order("created_at", { ascending: false });

    if (dbErr) throw dbErr;
    if (!contacts?.length) {
      return new Response(JSON.stringify({ leads: [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Query Neo4j for shared schools/companies between people
    let neo4jContext = "";
    try {
      const contactNames = contacts.map((c) => c.name);
      const result = await queryNeo4j(
        `MATCH (p:Person)-[:ATTENDED]->(s:School)<-[:ATTENDED]-(other:Person)
         WHERE p.name IN $names AND other.name IN $names AND p.name <> other.name
         RETURN p.name AS person, other.name AS connection, 'school' AS type, s.name AS shared
         UNION
         MATCH (p:Person)-[:WORKED_AT]->(c:Company)<-[:WORKED_AT]-(other:Person)
         WHERE p.name IN $names AND other.name IN $names AND p.name <> other.name
         RETURN p.name AS person, other.name AS connection, 'company' AS type, c.name AS shared
         LIMIT 50`,
        { names: contactNames }
      );

      if (result?.data?.length) {
        const rows = result.data.map((r: { row: string[] }) => r.row);
        neo4jContext = `\n\nGraph relationships found:\n${rows
          .map((r: string[]) => `- ${r[0]} and ${r[1]} share ${r[2]}: ${r[3]}`)
          .join("\n")}`;
      }
    } catch (e) {
      console.warn("Neo4j query failed, proceeding with bio-only matching:", e);
      neo4jContext = "\n\n(Neo4j graph data unavailable - ranking based on bios only)";
    }

    // Batch contacts to avoid massive single prompts
    const BATCH_SIZE = 15;
    const batches = [];
    for (let i = 0; i < contacts.length; i += BATCH_SIZE) {
      batches.push(contacts.slice(i, i + BATCH_SIZE));
    }

    // Helper to evaluate a batch
    const evaluateBatch = async (batchContacts: { name: string, headline?: string, company?: string, bio?: string, schools?: string[], companies?: string[], skills?: string[] }[]) => {
      const contactSummaries = batchContacts
        .map((c) => {
          let text = `- ${c.name}: ${c.headline || "No headline"}. Current Company: ${c.company || "Unknown"}. Bio: ${(c.bio || "").slice(0, 200)}`;
          if (c.schools?.length) text += ` Schools/Education: ${c.schools.join(", ")}.`;
          if (c.companies?.length) text += ` Past/Present Companies: ${c.companies.join(", ")}.`;
          if (c.skills?.length) text += ` Interests/Tags: ${c.skills.join(", ")}.`;
          return text;
        })
        .join("\n");

      let hierarchyRules = `
CRITICAL RANKING HIERARCHY - IGNORING THIS IS A FAILURE:
1. SHARED AFFILIATIONS (Score 80-92): If a contact's "Schools/Education" or "Past/Present Companies" contains any word found in the User's "Affiliations", they MUST be ranked high.
2. USER TAGS / INTERESTS (Score 70-85): If a contact's "Interests/Tags" or bio contains any word found in the User's "Interests / Tags", they MUST be ranked immediately below Shared Affiliations.
3. SHARED GRAPH CONNECTIONS (Score 60-75): Contacts with shared connections in the Neo4j context.
4. BIO/INDUSTRY RELEVANCE (Score 40-60): General overlap in skills or job roles. Only use this if the above categories yield zero results!`;

      if (match_preference === "industry") {
        hierarchyRules = `
CRITICAL RANKING HIERARCHY - IGNORING THIS IS A FAILURE:
1. INDUSTRY / SKILLS / ROLE (Score 80-92): If a contact's "Interests/Tags" or bio contains any word found in the User's "Interests / Tags", or their role explicitly aligns with the user's industry.
2. SHARED AFFILIATIONS (Score 70-85): If a contact's "Schools/Education" or "Past/Present Companies" contains any word found in the User's "Affiliations".
3. SHARED GRAPH CONNECTIONS (Score 60-75): Contacts with shared connections in the Neo4j context.`;
      } else if (match_preference === "location") {
        hierarchyRules = `
CRITICAL RANKING HIERARCHY - IGNORING THIS IS A FAILURE:
1. EXACT LOCATION MATCH (Score 80-92): If a contact's location is near or exactly matches the User's "Location".
2. SHARED AFFILIATIONS AND TAGS (Score 70-80): Secondary ranking based on shared schools, companies, or tags.
3. SHARED GRAPH CONNECTIONS (Score 60-70): Contacts with shared connections in the Neo4j context.`;
      }

      const prompt = `You are a strict, rules-based networking AI. Analyze these contacts and rank them by networking potential, specifically matching them against the user's explicit affiliations and interests.
      
CRITICAL INSTRUCTION: You MUST heavily penalize general bio "relevance". You MUST heavily reward exact matches in "Affiliations", "Interests/Tags", or "Location" based on the user's preference.
Do NOT award 100% match scores easily. Max score should realistically be in the 80s or low 90s for incredible matches. Introduce variation in scores (e.g., 62, 74, 88) rather than clustering at 100 or 0.

User's Details:
Location: ${user_location ? user_location : "Not provided"}
Affiliations (Schools, Companies): ${user_affiliations ? user_affiliations : "Not provided"}
Interests / Tags: ${user_tags ? user_tags : "Not provided"}
Bio / Profile: ${user_bio ? user_bio : "No specific bio provided. Rank generally."}
Matching Preference Strategy: ${match_preference === "industry" ? "Prioritize Industry and Skills." : match_preference === "location" ? "Prioritize Location matching." : "Overall Balance with Affiliation emphasis."}

Contacts in network to evaluate in this batch:
${contactSummaries}
${neo4jContext}

Return a JSON object containing a single key "leads" which is an array of EVERY SINGLE CONTACT from THIS specific batch, fully evaluated and scored. The array MUST contain EXACTLY ${batchContacts.length} items. Each object in the array must have:
- "name": string (exact name from list)
- "headline": string (their headline)
- "company": string (their company)
- "match_score": number (0-100, how valuable this connection is for the user based on the selected priority rules)
- "match_reason": string (Must be exactly one of: "Education", "Industry", "Role", "Skills", "Company", "Location", or "Other")
- "match_reason_details": string (1-2 short sentences explaining the specific overlap or reason for the match)
${hierarchyRules}

DO NOT rank someone high just because they have a "strong" or "long" bio. Follow the strict hierarchy rules above!

Return ONLY the JSON object, no other text.`;

      const aiResponse = await fetch("https://generativelanguage.googleapis.com/v1beta/openai/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${GEMINI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gemini-2.5-flash",
          max_tokens: 8192,
          messages: [
            { role: "system", content: "You are a professional networking analyst. Return only a strictly valid JSON object. ALL JSON keys must be double-quoted and ensuring no trailing commas are used." },
            { role: "user", content: prompt },
          ],
          response_format: { type: "json_object" },
        }),
      });

      if (!aiResponse.ok) {
        throw new Error(`Gemini API Error: ${aiResponse.status} ${await aiResponse.text()}`);
      }

      const aiData = await aiResponse.json();
      const content = aiData.choices?.[0]?.message?.content || "[]";
      let jsonStr = content;
      const match = content.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (match) jsonStr = match[1].trim();

      // Clean up common JSON mistakes the AI might make (unquoted keys, trailing commas)
      jsonStr = jsonStr.replace(/([{,]\s*)([a-zA-Z0-9_]+)\s*:/g, '$1"$2":');
      jsonStr = jsonStr.replace(/,\s*([}\]])/g, '$1');

      let parsed;
      try {
        parsed = JSON.parse(jsonStr);
      } catch (err) {
        console.error("Failed to parse JSON:", jsonStr);
        throw err;
      }
      return parsed.leads || [];
    };

    // Execute all batches in parallel
    const allResults = await Promise.all(batches.map(b => evaluateBatch(b)));

    // Flatten, filter, deduplicate, and sort the combined results
    const combinedLeads = allResults.flat();
    const sortedLeads = combinedLeads.sort((a: { match_score: number }, b: { match_score: number }) => b.match_score - a.match_score);

    // Take top N overall
    const finalLeads = sortedLeads.slice(0, top_n);

    return new Response(JSON.stringify({ leads: finalLeads }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("ai-matchmaker error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

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
    const { top_n = 5, user_bio = "", user_location = "", user_affiliations = "", user_tags = "" } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

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

    // Build prompt for Gemini
    const contactSummaries = contacts
      .map((c) => {
        let text = `- ${c.name}: ${c.headline || "No headline"}. Current Company: ${c.company || "Unknown"}. Bio: ${(c.bio || "").slice(0, 200)}`;
        if (c.schools?.length) text += ` Schools/Education: ${c.schools.join(", ")}.`;
        if (c.companies?.length) text += ` Past/Present Companies: ${c.companies.join(", ")}.`;
        if (c.skills?.length) text += ` Interests/Tags: ${c.skills.join(", ")}.`;
        return text;
      })
      .join("\n");

    const prompt = `You are a professional networking AI. Analyze these contacts and rank them by networking potential, specifically matching them against the user's bio/interests, location, and specific affiliations if provided.

CRITICAL INSTRUCTION: If the user has provided specific Affiliations (Schools, Companies, Organizations), you MUST heavily scrutinize the contacts list for these exact or highly similar names. Contacts sharing these affiliations must be heavily prioritized and their match_score significantly boosted (85-100 range).

User's Details:
Location: ${user_location ? user_location : "Not provided"}
Affiliations (Schools, Companies): ${user_affiliations ? user_affiliations : "Not provided"}
Interests / Tags: ${user_tags ? user_tags : "Not provided"}
Bio / Profile: ${user_bio ? user_bio : "No specific bio provided. Rank generally."}

Contacts in network:
${contactSummaries}
${neo4jContext}

Return a JSON array of the top ${top_n} leads. Each object must have:
- "name": string (exact name from list)
- "headline": string (their headline)
- "company": string (their company)
- "match_score": number (0-100, how valuable this connection is for the user based on their specific bio/interests, location, and shared connections)
- "match_reason": string (Must be exactly one of: "Education", "Industry", "Role", "Skills", "Company", "Location", or "Other")
- "match_reason_details": string (1-2 short sentences explaining the specific overlap or reason for the match)
- "suggested_intro": string (2-3 sentence personalized intro message explaining why they are a good match for the user)

CRITICAL RANKING HIERARCHY - YOU MUST FOLLOW THIS EXACT ORDER OF IMPORTANCE:
1. SHARED AFFILIATIONS: If a contact shares specific Schools or Companies listed in the User's "Affiliations", they MUST trigger a match_score > 90 and be placed at the very top of the list.
2. USER TAGS / INTERESTS: Heavily scrutinize contacts whose "Interests/Tags" or bio keywords align exactly with the User's explicitly listed "Interests / Tags". Note that finding these specific tag keywords in their bio heavily overrides the general "quality" of their bio.
3. SHARED GRAPH CONNECTIONS: Contacts with shared connections in the Neo4j context.
4. BIO/INDUSTRY RELEVANCE: General overlap in skills or job roles.
5. SENIORITY/INDUSTRY LEADERS (Lowest Priority): ONLY prioritize high-level industry leaders if there are absolutely no direct matches in the above categories.

Return ONLY the JSON array, no other text.`;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "You are a professional networking analyst. Return only valid JSON." },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!aiResponse.ok) {
      const status = aiResponse.status;
      if (status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted" }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await aiResponse.text();
      console.error("AI error:", status, t);
      throw new Error("AI gateway error");
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content || "[]";

    let jsonStr = content;
    const match = content.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (match) jsonStr = match[1].trim();

    const leads = JSON.parse(jsonStr);

    return new Response(JSON.stringify({ leads }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("ai-matchmaker error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

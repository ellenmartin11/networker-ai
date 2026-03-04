import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const {
      user_name = "",
      user_bio = "",
      user_location = "",
      user_affiliations = "",
      user_tags = "",
      lead_name = "",
      lead_headline = "",
      lead_company = "",
      match_reason = "",
      match_reason_details = ""
    } = await req.json();

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY not configured");

    const prompt = `You are an expert at writing authentic, humanized outreach messages. Your goal is to write a highly personalized, casual but professional 2-3 sentence introduction message for a user to send to a potential networking contact. 

Crucially:
- AVOID generic AI buzzwords (e.g., "I hope this finds you well", "synergy", "delve", "testament").
- Keep the tone warm, authentic, and concise, as if written by a real person quickly reaching out after noticing a point of shared interest.
- Focus on the specific Match Reason or Details as the "hook" rather than just listing facts.

User Details:
Name: ${user_name ? user_name : "Not provided"}
Location: ${user_location ? user_location : "Not provided"}
Affiliations (Schools, Companies): ${user_affiliations ? user_affiliations : "Not provided"}
Interests / Tags: ${user_tags ? user_tags : "Not provided"}
Bio: ${user_bio ? user_bio : "Not provided"}

Contact Details:
Name: ${lead_name}
Headline: ${lead_headline}
Company: ${lead_company}
Match Reason: ${match_reason}
Match Details: ${match_reason_details}

Write strictly the 2-3 sentence introduction message. Do not include any JSON formatting, internal thoughts, or pleasantries outside of the actual message.`;

    const aiResponse = await fetch("https://generativelanguage.googleapis.com/v1beta/openai/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GEMINI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gemini-2.5-flash",
        messages: [
          { role: "system", content: "You are a professional networking assistant that writes personalized intros. Return only the message text itself." },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!aiResponse.ok) {
      const status = aiResponse.status;
      if (status === 429) {
        return new Response(JSON.stringify({ error: "Gemini API rate limit exceeded. Please try again later or check your API key quota." }), {
          status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (status === 402) {
        return new Response(JSON.stringify({ error: "Gemini API credits exhausted. Please check your billing/quota." }), {
          status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await aiResponse.text();
      console.error("AI error:", status, t);
      return new Response(JSON.stringify({ error: `AI Error (Status: ${status}): ${t}` }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content || "";

    return new Response(JSON.stringify({ greeting: content.trim() }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-greeting error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

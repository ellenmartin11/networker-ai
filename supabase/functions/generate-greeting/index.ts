const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
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
      match_reason_details = "",
    } = await req.json();

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY not configured");

    const prompt = `You are an expert at writing authentic, humanized outreach messages. Write a highly personalized, casual but professional 2-3 sentence introduction message for a user to send to a potential networking contact.

Crucially:
- AVOID generic AI buzzwords (e.g., "I hope this finds you well", "synergy", "delve", "testament").
- Keep the tone warm, authentic, and concise, as if written by a real person noticing a point of shared interest.
- Focus on the specific Match Reason as the "hook".

User: ${user_name || "Not provided"}, ${user_location || ""}, Affiliations: ${user_affiliations || "none"}, Interests: ${user_tags || "none"}, Bio: ${user_bio || "none"}.
Contact: ${lead_name}, ${lead_headline || ""} at ${lead_company || ""}. Match: ${match_reason} - ${match_reason_details}.

Write only the 2-3 sentence message. No JSON, no metadata.`;

    const aiResponse = await fetch("https://generativelanguage.googleapis.com/v1beta/openai/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GEMINI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gemini-2.5-flash",
        messages: [
          { role: "system", content: "You are a professional networking assistant. Return only the message text." },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!aiResponse.ok) {
      const status = aiResponse.status;
      const t = await aiResponse.text();
      console.error("AI error:", status, t);
      return new Response(
        JSON.stringify({ error: `Gemini error (${status}): ${status === 503 ? "High demand, try again soon." : status === 429 ? "Rate limit exceeded." : t}` }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiData = await aiResponse.json();
    const greeting = aiData.choices?.[0]?.message?.content?.trim() || "";

    return new Response(
      JSON.stringify({ greeting }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("generate-greeting error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

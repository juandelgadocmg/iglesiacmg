import { createClient } from "https://esm.sh/@supabase/supabase-js@2.98.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const now = new Date();
    const today = now.toISOString().split("T")[0];
    const todayMonth = now.getMonth() + 1;
    const todayDay = now.getDate();

    // Get upcoming events (next 3 days)
    const threeDaysLater = new Date(now);
    threeDaysLater.setDate(threeDaysLater.getDate() + 3);
    const { data: upcomingEvents } = await supabase
      .from("eventos")
      .select("nombre, fecha_inicio, lugar")
      .gte("fecha_inicio", today)
      .lte("fecha_inicio", threeDaysLater.toISOString().split("T")[0]);

    // Get birthdays today
    const { data: allPersonas } = await supabase
      .from("personas")
      .select("nombres, apellidos, fecha_nacimiento, email");

    const birthdaysToday = (allPersonas || []).filter((p) => {
      if (!p.fecha_nacimiento) return false;
      const bday = new Date(p.fecha_nacimiento);
      return bday.getMonth() + 1 === todayMonth && bday.getDate() === todayDay;
    });

    // Get all user emails for notification
    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id, display_name");

    const { data: authUsers } = await supabase.auth.admin.listUsers();
    const userEmails = (authUsers?.users || []).map((u) => ({
      email: u.email,
      name:
        profiles?.find((p) => p.user_id === u.id)?.display_name ||
        u.email?.split("@")[0],
    }));

    // Build notification content
    const notifications: string[] = [];

    if (birthdaysToday.length > 0) {
      notifications.push("🎂 CUMPLEAÑOS DE HOY:");
      birthdaysToday.forEach((p) => {
        notifications.push(`  • ${p.nombres} ${p.apellidos}`);
      });
    }

    if ((upcomingEvents || []).length > 0) {
      notifications.push("\n📅 EVENTOS PRÓXIMOS (3 días):");
      (upcomingEvents || []).forEach((e) => {
        notifications.push(
          `  • ${e.nombre} — ${e.fecha_inicio} ${e.lugar ? `(${e.lugar})` : ""}`
        );
      });
    }

    if (notifications.length === 0) {
      return new Response(
        JSON.stringify({ message: "No notifications to send today" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Log the notifications (in production, integrate with an email service)
    console.log("=== DAILY NOTIFICATIONS ===");
    console.log(`Recipients: ${userEmails.map((u) => u.email).join(", ")}`);
    console.log(notifications.join("\n"));
    console.log("===========================");

    // Store notifications summary for in-app reference
    return new Response(
      JSON.stringify({
        success: true,
        summary: {
          birthdaysToday: birthdaysToday.length,
          upcomingEvents: (upcomingEvents || []).length,
          recipientCount: userEmails.length,
          content: notifications.join("\n"),
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in daily-notifications:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

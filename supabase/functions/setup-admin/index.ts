import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Check if admin user already exists
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    const adminExists = existingUsers?.users?.some(
      (u) => u.email === "admin@concrefuji.com.br"
    );

    if (adminExists) {
      // Update password for existing admin user
      const existingAdmin = existingUsers?.users?.find(
        (u) => u.email === "admin@concrefuji.com.br"
      );
      
      if (existingAdmin) {
        const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
          existingAdmin.id,
          { password: "admin123" }
        );

        if (updateError) {
          throw updateError;
        }

        return new Response(
          JSON.stringify({ 
            message: "Admin password updated successfully",
            email: "admin@concrefuji.com.br"
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Create admin user
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: "admin@concrefuji.com.br",
      password: "admin123",
      email_confirm: true,
      user_metadata: {
        first_name: "Admin",
        last_name: "Sistema",
      },
    });

    if (createError) {
      throw createError;
    }

    // The trigger handle_new_user should create the profile and role
    // But let's ensure admin role is set
    if (newUser?.user) {
      await supabaseAdmin
        .from("user_roles")
        .upsert({ user_id: newUser.user.id, role: "admin" }, { onConflict: "user_id" });
    }

    return new Response(
      JSON.stringify({ 
        message: "Admin user created successfully",
        email: "admin@concrefuji.com.br",
        userId: newUser?.user?.id
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

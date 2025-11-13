import { getServerComponentClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import AIAssistantInterface from "@/components/ai/AIAssistantInterface";

export const dynamic = "force-dynamic";

export default async function AIAssistantPage() {
  const supabase = getServerComponentClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect("/login");

  const { data: userRow } = await supabase.from("users").select("*").eq("id", session.user.id).single();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gsv-charcoal">AI Assistant</h1>
        <p className="text-gsv-gray mt-2">
          Get help with operations, knowledge queries, data analysis, and more
        </p>
      </div>

      <AIAssistantInterface user={userRow} />
    </div>
  );
}


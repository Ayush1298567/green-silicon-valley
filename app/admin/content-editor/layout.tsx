import { redirect } from "next/navigation";
import { getServerComponentClient } from "@/lib/supabase/server";
import { getDashboardPathForRole, type UserRole } from "@/lib/auth/roles";

export const dynamic = "force-dynamic";

export default async function ContentEditorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = getServerComponentClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect("/login");

  const { data: rows } = await supabase
    .from("users")
    .select("role")
    .eq("id", session.user.id)
    .limit(1);
  const role = (rows?.[0]?.role as UserRole) ?? "volunteer";

  // Allow founders and interns
  if (role !== "founder" && role !== "intern") {
    redirect(getDashboardPathForRole(role));
  }

  return <>{children}</>;
}


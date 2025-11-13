import { redirect } from "next/navigation";
import { getServerComponentClient } from "@/lib/supabase/server";
import { getDashboardPathForRole, type UserRole } from "@/lib/auth/roles";

export const dynamic = "force-dynamic";

export default async function DashboardIndex() {
  const supabase = getServerComponentClient();
  const {
    data: { session }
  } = await supabase.auth.getSession();
  if (!session) {
    redirect("/login");
  }
  const userId = session.user.id;
  const { data: rows } = await supabase
    .from("users")
    .select("role")
    .eq("id", userId)
    .limit(1);
  const role = (rows?.[0]?.role as UserRole) ?? "volunteer";
  redirect(getDashboardPathForRole(role));
}



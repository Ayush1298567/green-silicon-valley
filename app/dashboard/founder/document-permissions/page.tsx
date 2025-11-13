import { redirect } from "next/navigation";
import { getServerComponentClient } from "@/lib/supabase/server";
import { getDashboardPathForRole, type UserRole } from "@/lib/auth/roles";
import DocumentPermissionsInterface from "@/components/documents/DocumentPermissionsInterface";

export const dynamic = "force-dynamic";

export default async function DocumentPermissionsPage() {
  const supabase = getServerComponentClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect("/login");
  
  const { data: rows } = await supabase.from("users").select("role").eq("id", session.user.id).limit(1);
  const role = (rows?.[0]?.role as UserRole) ?? "volunteer";
  
  if (role !== "founder") redirect(getDashboardPathForRole(role));

  // Fetch all resources
  const { data: resources } = await supabase
    .from("resources")
    .select("*")
    .eq("is_archived", false)
    .order("created_at", { ascending: false })
    .limit(500);

  // Fetch all interns and volunteers
  const { data: users } = await supabase
    .from("users")
    .select("id, name, email, role")
    .in("role", ["intern", "volunteer"])
    .order("name");

  // Fetch all existing permissions
  const { data: permissions } = await supabase
    .from("document_permissions")
    .select(`
      *,
      user:users!document_permissions_user_id_fkey(id, name, email, role),
      resource:resources!document_permissions_resource_id_fkey(id, filename, category),
      granted_by_user:users!document_permissions_granted_by_fkey(id, name)
    `)
    .order("granted_at", { ascending: false });

  return (
    <div className="container py-10">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Document Permissions</h1>
        <p className="mt-2 text-gsv-gray">
          Grant interns and volunteers access to view, edit, or manage specific documents and resources
        </p>
      </div>

      <DocumentPermissionsInterface 
        resources={resources || []}
        users={users || []}
        permissions={permissions || []}
        currentUserId={session.user.id}
      />
    </div>
  );
}


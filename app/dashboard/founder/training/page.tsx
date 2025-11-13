import { getServerComponentClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getDashboardPathForRole, type UserRole } from "@/lib/auth/roles";
import TrainingMaterialsInterface from "@/components/training/TrainingMaterialsInterface";

export const dynamic = "force-dynamic";

export default async function TrainingMaterialsPage() {
  const supabase = getServerComponentClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect("/login");

  const { data: userRow } = await supabase.from("users").select("role").eq("id", session.user.id).single();
  const role = (userRow?.role as UserRole) ?? "volunteer";

  if (role !== "founder" && role !== "intern") redirect(getDashboardPathForRole(role));

  // Fetch training materials
  const { data: trainingMaterials } = await supabase
    .from("resources")
    .select("*")
    .eq("category", "training")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gsv-charcoal">Training Materials</h1>
        <p className="text-gsv-gray mt-2">
          Upload and manage training resources, PDFs, and Google Docs/Slides for volunteers
        </p>
      </div>

      <TrainingMaterialsInterface 
        materials={trainingMaterials || []}
        canEdit={role === "founder"}
      />
    </div>
  );
}


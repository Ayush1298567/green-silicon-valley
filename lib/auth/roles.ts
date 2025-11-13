export type UserRole = "founder" | "intern" | "volunteer" | "teacher" | "partner";

export function getDashboardPathForRole(role: UserRole | null | undefined) {
  switch (role) {
    case "founder":
      return "/dashboard/founder";
    case "intern":
      return "/dashboard/intern";
    case "volunteer":
      return "/dashboard/volunteer";
    default:
      return "/";
  }
}



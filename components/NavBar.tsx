import Link from "next/link";
import Image from "next/image";
import NotificationsBell from "@/components/NotificationsBell";
import MobileMenu from "@/components/MobileMenu";
import SearchBarWrapper from "@/components/SearchBarWrapper";
import { getServerComponentClient } from "@/lib/supabase/server";

const NavBar = async () => {
  const supabase = getServerComponentClient();
  let links: Array<{ label: string; href: string }> = [
    { label: "Home", href: "/" },
    { label: "About", href: "/about" },
    { label: "Impact", href: "/impact" },
    { label: "Get Involved", href: "/get-involved" },
    { label: "Contact", href: "/contact" },
    { label: "Blog", href: "/blog" }
  ];
  let sessionUserId: string | null = null;
  try {
    const { data: { session } } = await supabase.auth.getSession();
    sessionUserId = session?.user?.id ?? null;
    const { data } = await supabase
      .from("nav_links")
      .select("label,href,link_order")
      .order("link_order", { ascending: true });
    if (data && data.length > 0) {
      links = data as any;
    }
  } catch {}
  return (
    <header className="border-b border-gsv-slate-200/50 bg-white/95 backdrop-blur-lg supports-[backdrop-filter]:bg-white/90 sticky top-0 z-nav shadow-soft">
      <div className="container py-4 flex items-center justify-between">
        <Link 
          href="/" 
          className="flex items-center gap-3 hover:opacity-90 transition-opacity group focus:outline-none focus:ring-2 focus:ring-gsv-green focus:ring-offset-2 focus:rounded"
          aria-label="Green Silicon Valley home page"
        >
          <Image src="/logo.svg" alt="Green Silicon Valley" width={160} height={80} priority className="h-12 w-auto group-hover:scale-105 transition-transform" />
        </Link>
        <nav className="hidden lg:flex items-center gap-8 text-sm font-semibold text-gsv-slate-700" aria-label="Main navigation">
          {links.map((l) => (
            <Link 
              key={l.href} 
              href={l.href as any}
              className="hover:text-gsv-green transition-all relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-gsv-green after:transition-all hover:after:w-full py-1 focus:outline-none focus:ring-2 focus:ring-gsv-green focus:ring-offset-2 focus:rounded"
              aria-label={`Navigate to ${l.label}`}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        {sessionUserId && (
          <div className="hidden lg:block flex-1 max-w-md mx-4">
            <SearchBarWrapper />
          </div>
        )}
        <div className="flex items-center gap-3">
          <NotificationsBell />
          <div className="hidden md:flex items-center gap-3">
            {sessionUserId ? (
              <>
                <Link
                  href="/dashboard"
                  className="px-4 py-2 text-gsv-slate-700 hover:text-gsv-green font-semibold rounded-lg hover:bg-gsv-slate-100 transition-all"
                >
                  Dashboard
                </Link>
                <a
                  href="/logout"
                  className="px-6 py-2 bg-gsv-green text-white font-semibold rounded-lg hover:bg-gsv-greenDark transition-all shadow-md hover:shadow-lg hover:scale-105"
                >
                  Logout
                </a>
              </>
            ) : (
              <Link
                href="/login"
                className="px-6 py-2 bg-gsv-green text-white font-semibold rounded-lg hover:bg-gsv-greenDark transition-all shadow-md hover:shadow-lg hover:scale-105"
              >
                Login
              </Link>
            )}
          </div>
          <MobileMenu links={links} isAuthenticated={!!sessionUserId} />
        </div>
      </div>
    </header>
  );
};

export default NavBar;



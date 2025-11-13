import Link from "next/link";
import { getServerComponentClient } from "@/lib/supabase/server";
import ProfessionalHero from "@/components/home/ProfessionalHero";
import ImpactShowcase from "@/components/home/ImpactShowcase";
import ProgramsShowcase from "@/components/home/ProgramsShowcase";
import TestimonialsCarousel from "@/components/home/TestimonialsCarousel";
import RecentBlogPosts from "@/components/home/RecentBlogPosts";
import PartnerLogos from "@/components/home/PartnerLogos";
import SocialMediaSection from "@/components/SocialMediaSection";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const supabase = getServerComponentClient();

  // Fetch dynamic stats with error handling
  let schoolsCount = 0;
  let volunteersCount = 0;
  let totalHours = 0;
  let presentationsCount = 0;
  let recentPosts: any[] = [];

  try {
    const [
      schoolsResult,
      volunteersResult,
      hoursResult,
      presentationsResult
    ] = await Promise.all([
      supabase.from("schools").select("*", { count: "exact", head: true }),
      supabase.from("volunteers").select("*", { count: "exact", head: true }).eq("status", "active"),
      supabase.from("volunteers").select("hours_total"),
      supabase.from("presentations").select("*", { count: "exact", head: true }).eq("status", "completed")
    ]);

    schoolsCount = schoolsResult.count || 0;
    volunteersCount = volunteersResult.count || 0;
    const hoursData = hoursResult.data || [];
    totalHours = hoursData.reduce((sum: number, v: any) => sum + (v.hours_total || 0), 0);
    presentationsCount = presentationsResult.count || 0;

    // Fetch recent blog posts
    const blogResult = await supabase
      .from("blog_posts")
      .select("id, title, slug, cover_image, category, created_at")
      .eq("published", true)
      .order("created_at", { ascending: false })
      .limit(3);
    
    recentPosts = blogResult.data || [];
  } catch (error) {
    // Silently handle errors - show page with default values
    console.error("Error fetching homepage data:", error);
  }

  return (
    <div>
      {/* Professional Hero Section */}
      <ProfessionalHero
        schoolsCount={schoolsCount || 0}
        volunteersCount={volunteersCount || 0}
        presentationsCount={presentationsCount || 0}
      />

      {/* Impact Showcase */}
      <ImpactShowcase
        schoolsCount={schoolsCount || 0}
        volunteersCount={volunteersCount || 0}
        totalHours={totalHours}
        presentationsCount={presentationsCount || 0}
      />

      {/* Programs Showcase */}
      <ProgramsShowcase />

      {/* Testimonials Carousel */}
      <section className="bg-gray-50 py-16">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gsv-charcoal mb-3">What People Say</h2>
            <p className="text-gsv-gray">Hear from teachers, students, and volunteers</p>
          </div>
          <TestimonialsCarousel />
        </div>
      </section>

      {/* Recent Blog Posts */}
      {recentPosts && recentPosts.length > 0 && (
        <section className="container py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gsv-charcoal mb-3">Latest from Our Blog</h2>
            <p className="text-gsv-gray">Stories, insights, and updates from our team</p>
          </div>
          <RecentBlogPosts posts={recentPosts} />
          <div className="text-center mt-8">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-gsv-green font-medium hover:underline"
            >
              Read More Articles →
            </Link>
          </div>
        </section>
      )}

      {/* Partner Logos */}
      <section className="bg-gray-50 py-16">
        <div className="container">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gsv-charcoal mb-2">Our Partners</h2>
            <p className="text-sm text-gsv-gray">Proud to work with these organizations</p>
          </div>
          <PartnerLogos />
        </div>
      </section>

      {/* Social Media Section */}
      <SocialMediaSection />

      {/* Call to Action */}
      <section className="py-24 bg-gradient-to-br from-gsv-green via-gsv-greenDark to-gsv-slate-900 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
            backgroundSize: '30px 30px'
          }} />
        </div>

        {/* Decorative Blobs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gsv-warm/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gsv-greenLight/20 rounded-full blur-3xl" />

        <div className="container relative z-10">
          <div className="max-w-4xl mx-auto text-center text-white">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Ready to Make an Impact?
            </h2>
            <p className="text-xl md:text-2xl text-white/90 mb-10 leading-relaxed">
              Join our community of student leaders dedicated to environmental education and sustainability
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/get-involved"
                className="group px-8 py-4 bg-white text-gsv-green font-semibold rounded-xl hover:scale-105 transition-all shadow-xl inline-flex items-center justify-center gap-2"
              >
                <span>Get Involved</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </Link>
              <Link
                href="/donate"
                className="group px-8 py-4 border-2 border-white/30 backdrop-blur-sm text-white font-semibold rounded-xl hover:bg-white/10 transition-all inline-flex items-center justify-center gap-2"
              >
                <span>Support Our Mission</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}



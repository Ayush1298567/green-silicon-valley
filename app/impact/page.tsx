import { getServerComponentClient } from "@/lib/supabase/server";
import InteractiveImpactMap from "@/components/impact/InteractiveImpactMap";
import ImpactMetricsGrid from "@/components/impact/ImpactMetricsGrid";
import ImpactCharts from "@/components/impact/ImpactCharts";
import ImpactTimeline from "@/components/impact/ImpactTimeline";
import SuccessStories from "@/components/impact/SuccessStories";
import SchoolsTable from "@/components/impact/SchoolsTable";
import VolunteerHighlights from "@/components/impact/VolunteerHighlights";
import { Award, TrendingUp, Users, MapPin } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ImpactPage() {
  const supabase = getServerComponentClient();

  // Fetch comprehensive impact data
  const [
    { data: schools },
    { data: presentations },
    { data: volunteers },
    { data: volunteerHours },
    { data: chapters },
  ] = await Promise.all([
    supabase.from("schools").select("*").eq("status", "active"),
    supabase.from("presentations").select("*"),
    supabase.from("volunteers").select("*").eq("status", "active"),
    supabase.from("volunteer_hours").select("*"),
    supabase.from("chapters").select("*").eq("status", "active"),
  ]);

  // Calculate metrics
  const totalSchools = schools?.length || 0;
  const totalPresentations = presentations?.length || 0;
  const totalVolunteers = volunteers?.length || 0;
  const completedPresentations = presentations?.filter(p => p.status === "completed").length || 0;
  const totalHours = volunteerHours?.reduce((sum, record) => sum + (record.hours_logged || 0), 0) || 0;
  const totalStudentsReached = presentations?.reduce((sum, p) => sum + (p.student_count || 0), 0) || 0;
  const totalChapters = chapters?.length || 0;

  // Calculate growth metrics (compare last 30 days vs previous 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const sixtyDaysAgo = new Date();
  sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

  const recentPresentations = presentations?.filter(p => 
    new Date(p.scheduled_date || "") >= thirtyDaysAgo
  ).length || 0;
  
  const previousPresentations = presentations?.filter(p => {
    const date = new Date(p.scheduled_date || "");
    return date >= sixtyDaysAgo && date < thirtyDaysAgo;
  }).length || 0;

  const presentationsGrowth = previousPresentations > 0 
    ? Math.round(((recentPresentations - previousPresentations) / previousPresentations) * 100)
    : 100;

  // Prepare data for map (schools with lat/long)
  const schoolLocations = schools?.filter(s => s.latitude && s.longitude).map(s => ({
    id: s.id,
    name: s.name,
    lat: s.latitude,
    lng: s.longitude,
    presentations: s.total_presentations_hosted || 0,
    city: s.city || "Unknown",
    state: s.state || "CA",
  })) || [];

  // Prepare data for charts
  const presentationsByMonth = getPresentationsByMonth(presentations || []);
  const hoursByMonth = getHoursByMonth(volunteerHours || []);
  const topVolunteers = getTopVolunteers(volunteers || [], volunteerHours || []);

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-gsv-greenSoft to-white py-16">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl font-bold text-gsv-charcoal mb-4">
              Our Impact
            </h1>
            <p className="text-lg text-gsv-gray leading-relaxed">
              Tracking our environmental education reach and the collective power of our volunteers
            </p>
          </div>
        </div>
      </section>

      {/* Real-time Metrics */}
      <section className="container py-12">
        <ImpactMetricsGrid
          totalSchools={totalSchools}
          totalPresentations={totalPresentations}
          completedPresentations={completedPresentations}
          totalVolunteers={totalVolunteers}
          totalHours={totalHours}
          totalStudentsReached={totalStudentsReached}
          totalChapters={totalChapters}
          presentationsGrowth={presentationsGrowth}
        />
      </section>

      {/* Interactive Map */}
      <section className="container py-12">
        <div className="flex items-center gap-2 mb-6">
          <MapPin className="w-6 h-6 text-gsv-green" />
          <h2 className="text-3xl font-bold text-gsv-charcoal">Where We’ve Made an Impact</h2>
        </div>
        <p className="text-gsv-gray mb-8 max-w-2xl">
          Explore the schools we’ve reached across the region. Each marker represents a school partnership, with size indicating presentation frequency.
        </p>
        <InteractiveImpactMap schoolLocations={schoolLocations} />
      </section>

      {/* Charts & Visualizations */}
      <section className="bg-gray-50 py-12">
        <div className="container">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-6 h-6 text-gsv-green" />
            <h2 className="text-3xl font-bold text-gsv-charcoal">Growth Over Time</h2>
          </div>
          <ImpactCharts 
            presentationsByMonth={presentationsByMonth}
            hoursByMonth={hoursByMonth}
          />
        </div>
      </section>

      {/* Volunteer Highlights */}
      <section className="container py-12">
        <div className="flex items-center gap-2 mb-6">
          <Users className="w-6 h-6 text-gsv-green" />
          <h2 className="text-3xl font-bold text-gsv-charcoal">Top Contributors</h2>
        </div>
        <p className="text-gsv-gray mb-8 max-w-2xl">
          Recognizing our most dedicated volunteers who make our mission possible
        </p>
        <VolunteerHighlights topVolunteers={topVolunteers} />
      </section>

      {/* Timeline */}
      <section className="bg-gray-50 py-12">
        <div className="container">
          <div className="flex items-center gap-2 mb-6">
            <Award className="w-6 h-6 text-gsv-green" />
            <h2 className="text-3xl font-bold text-gsv-charcoal">Our Journey</h2>
          </div>
          <p className="text-gsv-gray mb-8 max-w-2xl">
            Key milestones in Green Silicon Valley’s growth and impact
          </p>
          <ImpactTimeline />
        </div>
      </section>

      {/* Success Stories */}
      <section className="container py-12">
        <h2 className="text-3xl font-bold text-gsv-charcoal mb-6">Success Stories</h2>
        <p className="text-gsv-gray mb-8 max-w-2xl">
          Real stories from teachers, students, and volunteers about the difference we’re making
        </p>
        <SuccessStories />
      </section>

      {/* Schools Partnership Table */}
      <section className="bg-gray-50 py-12">
        <div className="container">
          <h2 className="text-3xl font-bold text-gsv-charcoal mb-6">School Partnerships</h2>
          <p className="text-gsv-gray mb-8 max-w-2xl">
            A complete list of schools we’ve partnered with and their presentation history
          </p>
          <SchoolsTable schools={schools || []} />
        </div>
      </section>
    </div>
  );
}

// Helper functions for data processing
function getPresentationsByMonth(presentations: any[]) {
  const monthCounts: { [key: string]: number } = {};
  const now = new Date();
  
  // Initialize last 12 months
  for (let i = 11; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    monthCounts[key] = 0;
  }

  // Count presentations
  presentations.forEach(p => {
    if (p.scheduled_date) {
      const date = new Date(p.scheduled_date);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (monthCounts.hasOwnProperty(key)) {
        monthCounts[key]++;
      }
    }
  });

  return Object.entries(monthCounts).map(([month, count]) => ({
    month,
    count,
  }));
}

function getHoursByMonth(volunteerHours: any[]) {
  const monthHours: { [key: string]: number } = {};
  const now = new Date();
  
  // Initialize last 12 months
  for (let i = 11; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    monthHours[key] = 0;
  }

  // Sum hours
  volunteerHours.forEach(h => {
    if (h.date) {
      const date = new Date(h.date);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (monthHours.hasOwnProperty(key)) {
        monthHours[key] += h.hours_logged || 0;
      }
    }
  });

  return Object.entries(monthHours).map(([month, hours]) => ({
    month,
    hours,
  }));
}

function getTopVolunteers(volunteers: any[], volunteerHours: any[]) {
  const volunteerTotalHours: { [key: string]: { volunteer: any; hours: number } } = {};

  volunteers.forEach(v => {
    volunteerTotalHours[v.id] = { volunteer: v, hours: 0 };
  });

  volunteerHours.forEach(h => {
    if (volunteerTotalHours[h.volunteer_id]) {
      volunteerTotalHours[h.volunteer_id].hours += h.hours_logged || 0;
    }
  });

  return Object.values(volunteerTotalHours)
    .sort((a, b) => b.hours - a.hours)
    .slice(0, 10);
}

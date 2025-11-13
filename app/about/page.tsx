export default function AboutPage() {
  return (
    <div className="container py-14">
      <h1 className="text-3xl font-bold">About Green Silicon Valley</h1>
      <p className="mt-4 text-gsv-gray max-w-3xl">
        GSV is a youth-led nonprofit based in Santa Clara, California. We
        empower high school students to lead environmental STEM presentations in
        local classrooms, building leadership, communication, and technical
        skills while bringing hands-on education to younger students.
      </p>
      <div className="grid md:grid-cols-2 gap-6 mt-10">
        <div className="card p-6">
          <h2 className="font-semibold text-lg">Story & Mission</h2>
          <p className="mt-2 text-sm text-gsv-gray">
            Our mission is to make sustainability education engaging and
            accessible, while developing the next generation of climate leaders.
          </p>
        </div>
        <div className="card p-6">
          <h2 className="font-semibold text-lg">Leadership</h2>
          <p className="mt-2 text-sm text-gsv-gray">
            GSV is organized into six departments, each led by a student
            Director: Media, Technology, Outreach, Operations, Volunteer
            Development, and Communications.
          </p>
        </div>
      </div>
      <div className="card p-6 mt-6">
        <h2 className="font-semibold text-lg">Grants & Partners</h2>
        <p className="mt-2 text-sm text-gsv-gray">
          We appreciate support from our community partners and grantors.
          Partner logos and acknowledgments will be displayed here.
        </p>
      </div>
    </div>
  );
}



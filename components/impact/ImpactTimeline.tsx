"use client";

const milestones = [
  {
    date: "September 2020",
    title: "Green Silicon Valley Founded",
    description: "Started by three high school students passionate about environmental education",
    icon: "🌱",
  },
  {
    date: "October 2020",
    title: "First School Presentation",
    description: "Delivered our inaugural presentation at Lincoln Elementary on recycling basics",
    icon: "🎓",
  },
  {
    date: "January 2021",
    title: "10 Volunteers Milestone",
    description: "Recruited and trained our first 10 dedicated volunteers",
    icon: "👥",
  },
  {
    date: "March 2021",
    title: "25 Presentations Reached",
    description: "Celebrated completing 25 presentations across 8 different schools",
    icon: "🎉",
  },
  {
    date: "May 2021",
    title: "First Earth Day Event",
    description: "Organized community-wide Earth Day celebration with 200+ attendees",
    icon: "🌍",
  },
  {
    date: "September 2021",
    title: "Expanded to Middle Schools",
    description: "Launched specialized curriculum for grades 6-8",
    icon: "📚",
  },
  {
    date: "January 2022",
    title: "1000 Students Reached",
    description: "Milestone of reaching over 1,000 students with our programs",
    icon: "🎯",
  },
  {
    date: "April 2022",
    title: "First Chapter Established",
    description: "Launched our first regional chapter in San Jose",
    icon: "📍",
  },
  {
    date: "June 2022",
    title: "Intern Program Launch",
    description: "Created structured 6-department internship program",
    icon: "💼",
  },
  {
    date: "October 2022",
    title: "50 Schools Partnership",
    description: "Formed official partnerships with 50 schools across the region",
    icon: "🏫",
  },
  {
    date: "March 2023",
    title: "2500 Volunteer Hours",
    description: "Our volunteers collectively contributed 2,500+ hours to environmental education",
    icon: "⏰",
  },
  {
    date: "Present",
    title: "Growing Every Day",
    description: "Continuing to expand our reach and impact across communities",
    icon: "🚀",
  },
];

export default function ImpactTimeline() {
  return (
    <div className="relative">
      {/* Timeline line */}
      <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-gsv-green via-green-300 to-gray-200"></div>

      <div className="space-y-12">
        {milestones.map((milestone, idx) => (
          <div
            key={idx}
            className={`relative flex items-center ${
              idx % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
            } gap-8`}
          >
            {/* Content */}
            <div className={`flex-1 ${idx % 2 === 0 ? "md:text-right" : "md:text-left"}`}>
              <div className="card p-6 inline-block max-w-md">
                <div className="text-sm text-gsv-green font-semibold mb-2">{milestone.date}</div>
                <div className="flex items-center gap-2 mb-2 justify-start">
                  <span className="text-2xl">{milestone.icon}</span>
                  <h3 className="font-semibold text-lg">{milestone.title}</h3>
                </div>
                <p className="text-sm text-gsv-gray">{milestone.description}</p>
              </div>
            </div>

            {/* Center dot */}
            <div className="hidden md:block absolute left-1/2 -translate-x-1/2 w-4 h-4 bg-gsv-green rounded-full border-4 border-white shadow-md z-10"></div>

            {/* Spacer for alternating layout */}
            <div className="hidden md:block flex-1"></div>
          </div>
        ))}
      </div>
    </div>
  );
}


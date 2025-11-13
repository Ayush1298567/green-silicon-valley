import Link from "next/link";
import { Sparkles, Users, GraduationCap, Calendar, Award, BookOpen, Target, Heart } from "lucide-react";

export const dynamic = "force-dynamic";

export default function ProgramsPage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-gsv-greenSoft to-white py-16">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl font-bold text-gsv-charcoal mb-4">
              Our Programs
            </h1>
            <p className="text-lg text-gsv-gray leading-relaxed">
              Interactive, hands-on environmental STEM education programs designed to inspire and empower the next generation of leaders
            </p>
          </div>
        </div>
      </section>

      {/* For Elementary Schools */}
      <section className="container py-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-4">
              <BookOpen className="w-4 h-4" />
              Elementary School Program
            </div>
            <h2 className="text-3xl font-bold text-gsv-charcoal mb-4">
              Engaging Young Minds (Grades K-5)
            </h2>
            <p className="text-gsv-gray mb-6 leading-relaxed">
              Our elementary school presentations make environmental science fun and accessible through hands-on activities, 
              interactive demonstrations, and age-appropriate lessons that spark curiosity and wonder.
            </p>

            <div className="space-y-4">
              <FeatureItem 
                icon={<Sparkles className="w-5 h-5" />}
                title="Interactive Activities"
                description="Students participate in experiments, games, and group activities"
              />
              <FeatureItem 
                icon={<Target className="w-5 h-5" />}
                title="Age-Appropriate Content"
                description="Lessons tailored to K-5 comprehension levels with visual aids"
              />
              <FeatureItem 
                icon={<Calendar className="w-5 h-5" />}
                title="45-60 Minute Sessions"
                description="Perfect length to maintain engagement without disrupting schedules"
              />
            </div>

            <div className="mt-8 p-6 bg-blue-50 rounded-lg">
              <h3 className="font-semibold mb-3">Sample Topics:</h3>
              <ul className="grid sm:grid-cols-2 gap-2 text-sm text-gsv-gray">
                <li>• Recycling & Waste Management</li>
                <li>• Water Conservation</li>
                <li>• Plant Life Cycles</li>
                <li>• Animal Habitats</li>
                <li>• Weather & Climate Basics</li>
                <li>• Simple Machines & Energy</li>
                <li>• Healthy Ecosystems</li>
                <li>• Pollution Prevention</li>
              </ul>
            </div>
          </div>

          <div className="card p-8 bg-gradient-to-br from-blue-50 to-white">
            <div className="aspect-square bg-blue-100 rounded-lg flex items-center justify-center mb-6">
              <span className="text-6xl">🌱</span>
            </div>
            <h3 className="font-semibold text-xl mb-3">Learning Outcomes</h3>
            <ul className="space-y-3 text-sm text-gsv-gray">
              <li className="flex items-start gap-2">
                <span className="text-gsv-green mt-0.5">✓</span>
                <span>Understanding basic environmental concepts</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gsv-green mt-0.5">✓</span>
                <span>Developing curiosity about nature and science</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gsv-green mt-0.5">✓</span>
                <span>Learning simple actions to help the environment</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gsv-green mt-0.5">✓</span>
                <span>Building confidence in STEM subjects</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* For Middle Schools */}
      <section className="bg-gray-50 py-16">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1 card p-8 bg-white">
              <div className="aspect-square bg-green-100 rounded-lg flex items-center justify-center mb-6">
                <span className="text-6xl">🔬</span>
              </div>
              <h3 className="font-semibold text-xl mb-3">Advanced Content</h3>
              <ul className="space-y-3 text-sm text-gsv-gray">
                <li className="flex items-start gap-2">
                  <span className="text-gsv-green mt-0.5">✓</span>
                  <span>Scientific method and data analysis</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gsv-green mt-0.5">✓</span>
                  <span>Climate science and global impact</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gsv-green mt-0.5">✓</span>
                  <span>Renewable energy technology</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gsv-green mt-0.5">✓</span>
                  <span>Environmental engineering concepts</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gsv-green mt-0.5">✓</span>
                  <span>Aligned with Next Generation Science Standards (NGSS)</span>
                </li>
              </ul>
            </div>

            <div className="order-1 lg:order-2">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium mb-4">
                <GraduationCap className="w-4 h-4" />
                Middle School Program
              </div>
              <h2 className="text-3xl font-bold text-gsv-charcoal mb-4">
                Deep Dive Learning (Grades 6-8)
              </h2>
              <p className="text-gsv-gray mb-6 leading-relaxed">
                Our middle school presentations challenge students with more complex environmental science concepts, 
                critical thinking exercises, and real-world problem-solving scenarios that prepare them for high school and beyond.
              </p>

              <div className="space-y-4">
                <FeatureItem 
                  icon={<Target className="w-5 h-5" />}
                  title="Advanced Topics"
                  description="Climate change, renewable energy, ecosystem dynamics, and more"
                />
                <FeatureItem 
                  icon={<Users className="w-5 h-5" />}
                  title="Group Projects"
                  description="Collaborative problem-solving and team-based activities"
                />
                <FeatureItem 
                  icon={<Award className="w-5 h-5" />}
                  title="NGSS Aligned"
                  description="Curriculum aligned with Next Generation Science Standards"
                />
              </div>

              <div className="mt-8 p-6 bg-green-50 rounded-lg">
                <h3 className="font-semibold mb-3">Sample Topics:</h3>
                <ul className="grid sm:grid-cols-2 gap-2 text-sm text-gsv-gray">
                  <li>• Climate Change Science</li>
                  <li>• Renewable Energy Systems</li>
                  <li>• Biodiversity & Conservation</li>
                  <li>• Carbon Footprint Analysis</li>
                  <li>• Sustainable Agriculture</li>
                  <li>• Air & Water Quality</li>
                  <li>• Environmental Engineering</li>
                  <li>• Circular Economy</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Volunteer Program */}
      <section className="container py-16">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium mb-4">
            <Heart className="w-4 h-4" />
            Volunteer Program
          </div>
          <h2 className="text-3xl font-bold text-gsv-charcoal mb-4">
            Join Our Volunteer Team
          </h2>
          <p className="text-gsv-gray max-w-2xl mx-auto leading-relaxed">
            High school students gain valuable leadership experience while making a real impact in their community
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <ProgramCard
            icon="📚"
            title="Training Process"
            description="Comprehensive orientation covering presentation skills, activity facilitation, classroom management, and safety protocols"
          />
          <ProgramCard
            icon="👥"
            title="Team Structure"
            description="Work in teams of 3-6 volunteers for each presentation, with experienced leads mentoring new members"
          />
          <ProgramCard
            icon="⏰"
            title="Time Commitment"
            description="Flexible scheduling with presentations typically 1-2 hours including travel and setup"
          />
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="card p-8">
            <h3 className="font-semibold text-xl mb-4 flex items-center gap-2">
              <Award className="w-6 h-6 text-gsv-green" />
              Benefits & Skills Gained
            </h3>
            <ul className="space-y-3 text-sm text-gsv-gray">
              <li className="flex items-start gap-2">
                <span className="text-gsv-green mt-0.5">✓</span>
                <span><strong>Leadership Development:</strong> Lead activities and guide younger students</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gsv-green mt-0.5">✓</span>
                <span><strong>Public Speaking:</strong> Present to groups of 20-30 students regularly</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gsv-green mt-0.5">✓</span>
                <span><strong>Teaching Experience:</strong> Hands-on experience in education and mentorship</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gsv-green mt-0.5">✓</span>
                <span><strong>Project Management:</strong> Coordinate materials, schedules, and team logistics</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gsv-green mt-0.5">✓</span>
                <span><strong>Community Service Hours:</strong> Verified hours for college applications</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gsv-green mt-0.5">✓</span>
                <span><strong>Networking:</strong> Connect with like-minded peers and professionals</span>
              </li>
            </ul>
          </div>

          <div className="card p-8 bg-yellow-50">
            <h3 className="font-semibold text-xl mb-4">Volunteer Requirements</h3>
            <ul className="space-y-3 text-sm text-gsv-gray">
              <li className="flex items-start gap-2">
                <span className="text-yellow-600 mt-0.5">•</span>
                <span>Currently enrolled in high school (grades 9-12)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-600 mt-0.5">•</span>
                <span>Complete orientation and training (2-3 hours)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-600 mt-0.5">•</span>
                <span>Commit to at least 2 presentations per semester</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-600 mt-0.5">•</span>
                <span>Reliable transportation to presentation locations</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-600 mt-0.5">•</span>
                <span>Professional attitude and communication skills</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-600 mt-0.5">•</span>
                <span>Passion for environmental education and sustainability</span>
              </li>
            </ul>
            <div className="mt-6">
              <Link
                href="/get-involved#volunteer"
                className="inline-block w-full text-center px-6 py-3 bg-gsv-green text-white rounded-lg font-medium hover:bg-gsv-green/90 transition"
              >
                Apply to Volunteer
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Intern Program */}
      <section className="bg-gray-50 py-16">
        <div className="container">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-800 rounded-full text-sm font-medium mb-4">
              <GraduationCap className="w-4 h-4" />
              Intern Program
            </div>
            <h2 className="text-3xl font-bold text-gsv-charcoal mb-4">
              Leadership Opportunities
            </h2>
            <p className="text-gsv-gray max-w-2xl mx-auto leading-relaxed">
              Take on greater responsibility by leading one of our six operational departments
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            <DepartmentCard
              icon="📸"
              title="Media Department"
              description="Manage social media, graphic design, photography, videography, and event documentation"
              responsibilities={["Social media content", "Event photography", "Design materials", "Video production"]}
            />
            <DepartmentCard
              icon="💻"
              title="Technology"
              description="Oversee website, technical infrastructure, data systems, and digital tools"
              responsibilities={["Website maintenance", "Database management", "Analytics", "Technical support"]}
            />
            <DepartmentCard
              icon="📞"
              title="Outreach"
              description="Handle communication with schools, teachers, and external partners"
              responsibilities={["School partnerships", "Teacher relations", "Email communications", "Scheduling"]}
            />
            <DepartmentCard
              icon="📋"
              title="Operations"
              description="Manage logistics, scheduling, materials, and presentation coordination"
              responsibilities={["Event logistics", "Materials inventory", "Transportation", "Venue coordination"]}
            />
            <DepartmentCard
              icon="🎓"
              title="Volunteer Development"
              description="Responsible for volunteer recruitment, training, and recognition"
              responsibilities={["Recruitment", "Training programs", "Recognition", "Team building"]}
            />
            <DepartmentCard
              icon="📰"
              title="Communications"
              description="Produce newsletters, press releases, and manage public relations"
              responsibilities={["Newsletter creation", "Press releases", "Internal comms", "Public relations"]}
            />
          </div>

          <div className="card p-8 max-w-3xl mx-auto">
            <h3 className="font-semibold text-xl mb-4">Application Process</h3>
            <div className="space-y-4 text-sm text-gsv-gray">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-gsv-green text-white rounded-full flex items-center justify-center font-semibold">1</div>
                <div>
                  <strong className="text-gsv-charcoal">Submit Application</strong>
                  <p>Complete the online form with your department preferences (rank top 3), resume, and a 500-word essay</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-gsv-green text-white rounded-full flex items-center justify-center font-semibold">2</div>
                <div>
                  <strong className="text-gsv-charcoal">Interview</strong>
                  <p>Meet with current founders to discuss your interests, experience, and goals</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-gsv-green text-white rounded-full flex items-center justify-center font-semibold">3</div>
                <div>
                  <strong className="text-gsv-charcoal">Department Assignment</strong>
                  <p>Receive your department placement and begin onboarding with your team</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-gsv-green text-white rounded-full flex items-center justify-center font-semibold">4</div>
                <div>
                  <strong className="text-gsv-charcoal">Start Contributing</strong>
                  <p>Take on projects, attend team meetings, and make a real impact</p>
                </div>
              </div>
            </div>
            <div className="mt-6">
              <Link
                href="/get-involved#intern"
                className="inline-block w-full text-center px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition"
              >
                Apply for Internship
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Special Initiatives */}
      <section className="container py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gsv-charcoal mb-4">
            Special Initiatives
          </h2>
          <p className="text-gsv-gray max-w-2xl mx-auto leading-relaxed">
            Beyond regular presentations, we organize special events and campaigns throughout the year
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <InitiativeCard
            title="Earth Day Celebrations"
            description="Annual Earth Day events with special activities, community cleanups, and educational booths"
            season="Spring"
          />
          <InitiativeCard
            title="Arbor Day Tree Planting"
            description="Partner with schools to plant trees and teach students about forest ecosystems"
            season="Spring"
          />
          <InitiativeCard
            title="Summer Science Camps"
            description="Week-long environmental science camps for elementary students during summer break"
            season="Summer"
          />
          <InitiativeCard
            title="Fall Sustainability Fair"
            description="Community-wide event showcasing sustainable practices and green technologies"
            season="Fall"
          />
          <InitiativeCard
            title="Community Workshops"
            description="Public workshops on composting, solar energy, water conservation, and more"
            season="Year-round"
          />
          <InitiativeCard
            title="Partner Events"
            description="Collaborate with local environmental organizations for special educational events"
            season="Year-round"
          />
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-gsv-greenSoft to-green-100 py-16">
        <div className="container text-center">
          <h2 className="text-3xl font-bold text-gsv-charcoal mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-gsv-gray mb-8 max-w-2xl mx-auto">
            Whether you’re a teacher looking to bring environmental education to your classroom or a student ready to make a difference, we’d love to hear from you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/teachers/request"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-gsv-green border-2 border-gsv-green rounded-lg font-semibold hover:bg-gsv-greenSoft transition"
            >
              Request a Presentation
            </Link>
            <Link
              href="/get-involved"
              className="inline-flex items-center justify-center px-8 py-4 bg-gsv-green text-white rounded-lg font-semibold hover:bg-gsv-green/90 transition shadow-lg"
            >
              Join Our Team
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

const FeatureItem = ({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) => (
  <div className="flex gap-3">
    <div className="flex-shrink-0 w-10 h-10 bg-gsv-greenSoft rounded-lg flex items-center justify-center text-gsv-green">
      {icon}
    </div>
    <div>
      <h4 className="font-semibold text-gsv-charcoal mb-1">{title}</h4>
      <p className="text-sm text-gsv-gray">{description}</p>
    </div>
  </div>
);

const ProgramCard = ({ icon, title, description }: { icon: string; title: string; description: string }) => (
  <div className="card p-6 text-center hover:shadow-xl transition-shadow">
    <div className="text-4xl mb-4">{icon}</div>
    <h3 className="font-semibold text-lg mb-2">{title}</h3>
    <p className="text-sm text-gsv-gray">{description}</p>
  </div>
);

const DepartmentCard = ({ icon, title, description, responsibilities }: { 
  icon: string; 
  title: string; 
  description: string; 
  responsibilities: string[] 
}) => (
  <div className="card p-6 hover:shadow-xl transition-shadow">
    <div className="text-4xl mb-3">{icon}</div>
    <h3 className="font-semibold text-lg mb-2">{title}</h3>
    <p className="text-sm text-gsv-gray mb-4">{description}</p>
    <div className="pt-4 border-t">
      <p className="text-xs font-semibold text-gsv-charcoal mb-2">Key Responsibilities:</p>
      <ul className="text-xs text-gsv-gray space-y-1">
        {responsibilities.map((resp, idx) => (
          <li key={idx}>• {resp}</li>
        ))}
      </ul>
    </div>
  </div>
);

const InitiativeCard = ({ title, description, season }: { title: string; description: string; season: string }) => (
  <div className="card p-6 hover:shadow-lg transition-shadow">
    <div className="inline-block px-3 py-1 bg-gsv-greenSoft text-gsv-green text-xs font-medium rounded-full mb-3">
      {season}
    </div>
    <h3 className="font-semibold text-lg mb-2">{title}</h3>
    <p className="text-sm text-gsv-gray">{description}</p>
  </div>
);


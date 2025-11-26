"use client";
import { useState } from "react";
import { ChevronDown, ChevronUp, Users, School, Presentation, HelpCircle } from "lucide-react";

interface FAQItem {
  id: string;
  category: 'volunteers' | 'teachers' | 'parents' | 'general';
  question: string;
  answer: string;
}

const faqData: FAQItem[] = [
  // General Questions
  {
    id: 'what-is-gsv',
    category: 'general',
    question: 'What is Green Silicon Valley?',
    answer: 'Green Silicon Valley (GSV) is a student-led nonprofit organization that empowers high school students to deliver environmental STEM education presentations to local classrooms. Our mission is to foster the next generation of environmental leaders through hands-on learning experiences.'
  },
  {
    id: 'how-does-it-work',
    category: 'general',
    question: 'How does the program work?',
    answer: 'High school volunteers join teams of 3-4 students, receive training in environmental science and presentation skills, and deliver interactive presentations to local elementary and middle school classrooms. Teachers can request presentations through our website, and we coordinate the logistics.'
  },
  {
    id: 'who-can-participate',
    category: 'general',
    question: 'Who can participate in GSV?',
    answer: 'High school students (grades 9-12) can apply to be volunteers. Teachers from elementary and middle schools in our service area can request presentations. Parents and community members can support our mission through donations and partnerships.'
  },

  // Volunteer Questions
  {
    id: 'volunteer-requirements',
    category: 'volunteers',
    question: 'What are the requirements to become a volunteer?',
    answer: 'Volunteers must be in grades 9-12, have an interest in environmental issues, be committed to the program timeline, and be willing to work as part of a team. We look for students who are enthusiastic about science education and have good communication skills.'
  },
  {
    id: 'volunteer-commitment',
    category: 'volunteers',
    question: 'How much time does volunteering require?',
    answer: 'Initial commitment includes application, interview, and training (about 10-15 hours). Ongoing commitment is 5-10 hours per month including team meetings, content preparation, and 1-2 presentations. Most teams present once per month during the school year.'
  },
  {
    id: 'volunteer-training',
    category: 'volunteers',
    question: 'What training do volunteers receive?',
    answer: 'Volunteers receive comprehensive training in environmental science topics, presentation skills, classroom management, and interactive teaching techniques. Training includes both online modules and in-person sessions with experienced mentors.'
  },
  {
    id: 'volunteer-benefits',
    category: 'volunteers',
    question: 'What are the benefits of volunteering?',
    answer: 'Volunteers gain leadership experience, improve public speaking skills, learn about environmental science, build their resume, earn community service hours, and make a meaningful impact in their community. Many volunteers also form lasting friendships with their team members.'
  },

  // Teacher Questions
  {
    id: 'presentation-topics',
    category: 'teachers',
    question: 'What topics do you cover in presentations?',
    answer: 'Our presentations cover climate change, renewable energy, biodiversity, sustainable living, ocean conservation, waste management, and local environmental issues. Topics are tailored to grade level and can be customized based on your curriculum needs.'
  },
  {
    id: 'presentation-length',
    category: 'teachers',
    question: 'How long are the presentations?',
    answer: 'Presentation length varies by grade level: 45-60 minutes for grades 3-5, 60-75 minutes for grades 6-8, and 75-90 minutes for grades 9-12. All presentations include interactive activities and Q&A time.'
  },
  {
    id: 'presentation-cost',
    category: 'teachers',
    question: 'Is there a cost for presentations?',
    answer: 'All presentations are completely free! GSV is a nonprofit organization committed to making environmental education accessible to all schools. We only ask that classrooms be prepared and engaged for the presentation.'
  },
  {
    id: 'presentation-prep',
    category: 'teachers',
    question: 'What preparation is needed from teachers?',
    answer: 'Teachers should ensure classroom space is available, projector/smartboard access if possible, and that students are prepared for an interactive session. We provide all materials and handle the presentation content.'
  },

  // Parent Questions
  {
    id: 'parent-involvement',
    category: 'parents',
    question: 'How can parents get involved?',
    answer: 'Parents can volunteer as chaperones for presentations, help with fundraising events, spread awareness about our program, or donate to support our mission. We also welcome parent volunteers for administrative and logistical support.'
  },
  {
    id: 'student-safety',
    category: 'parents',
    question: 'How do you ensure student safety?',
    answer: 'All volunteers undergo background checks, receive training in classroom safety protocols, and present in pairs or small groups. Presentations are supervised by school staff, and we follow all school district safety guidelines.'
  },
  {
    id: 'curriculum-alignment',
    category: 'parents',
    question: 'How does this align with school curriculum?',
    answer: 'Our presentations are designed to align with Next Generation Science Standards (NGSS) and California environmental education standards. We can customize content to match your school\'s specific curriculum needs.'
  }
];

export default function FAQPage() {
  const [activeCategory, setActiveCategory] = useState<'all' | 'volunteers' | 'teachers' | 'parents' | 'general'>('all');
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());

  const categories = [
    { id: 'all', label: 'All Questions', icon: HelpCircle },
    { id: 'volunteers', label: 'For Volunteers', icon: Users },
    { id: 'teachers', label: 'For Teachers', icon: School },
    { id: 'parents', label: 'For Parents', icon: Presentation },
    { id: 'general', label: 'General', icon: HelpCircle }
  ];

  const filteredFAQs = activeCategory === 'all'
    ? faqData
    : faqData.filter(item => item.category === activeCategory);

  const toggleItem = (id: string) => {
    const newOpenItems = new Set(openItems);
    if (newOpenItems.has(id)) {
      newOpenItems.delete(id);
    } else {
      newOpenItems.add(id);
    }
    setOpenItems(newOpenItems);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-gsv-green via-gsv-greenDark to-gsv-slate-900 text-white py-20">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Frequently Asked Questions
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-8">
              Everything you need to know about Green Silicon Valley
            </p>
          </div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="py-12 bg-white border-b">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-wrap justify-center gap-4">
              {categories.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveCategory(id as any)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                    activeCategory === id
                      ? 'bg-gsv-green text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="py-16">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="space-y-4">
              {filteredFAQs.map((item) => (
                <div key={item.id} className="bg-white rounded-lg shadow-sm border">
                  <button
                    onClick={() => toggleItem(item.id)}
                    className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <span className="font-medium text-gray-900">{item.question}</span>
                    {openItems.has(item.id) ? (
                      <ChevronUp className="w-5 h-5 text-gray-500 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0" />
                    )}
                  </button>
                  {openItems.has(item.id) && (
                    <div className="px-6 pb-4">
                      <div className="border-t pt-4">
                        <p className="text-gray-700 leading-relaxed">{item.answer}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {filteredFAQs.length === 0 && (
              <div className="text-center py-12">
                <HelpCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No questions found</h3>
                <p className="text-gray-600">Try selecting a different category</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Still Have Questions */}
      <section className="py-16 bg-gsv-green/5">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Still Have Questions?</h2>
            <p className="text-lg text-gray-600 mb-8">
              Can&apos;t find the answer you&apos;re looking for? We&apos;re here to help!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/contact"
                className="bg-gsv-green text-white px-8 py-3 rounded-lg font-semibold hover:bg-gsv-greenDark transition-colors"
              >
                Contact Us
              </a>
              <a
                href="/how-it-works"
                className="border border-gray-300 text-gray-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                How It Works
              </a>
              <a
                href="/start-here"
                className="border border-gray-300 text-gray-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                Get Started
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

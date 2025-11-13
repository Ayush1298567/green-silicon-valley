"use client";
import { Quote } from "lucide-react";
import { useState } from "react";

const stories = [
  {
    id: 1,
    type: "teacher",
    name: "Ms. Jennifer Martinez",
    role: "5th Grade Teacher, Willow Elementary",
    story: "The GSV team transformed our science unit! After their presentation on renewable energy, my students were so excited they started a school-wide recycling competition. Three months later, we've reduced our waste by 40% and students are teaching their families at home. This is exactly the kind of real-world learning that sticks.",
    image: "👩‍🏫",
    date: "March 2024",
  },
  {
    id: 2,
    type: "student",
    name: "Alex Chen",
    role: "4th Grader",
    story: "I never knew science could be so cool! The volunteers showed us how to make a water filter and explained why clean water is important. Now I want to be an environmental engineer when I grow up. My science fair project was about water conservation and I won first place!",
    image: "🧒",
    date: "January 2024",
  },
  {
    id: 3,
    type: "volunteer",
    name: "Sarah Rodriguez",
    role: "High School Volunteer, 11th Grade",
    story: "Volunteering with GSV has been the most rewarding experience of my high school career. I've developed public speaking skills, learned to work with diverse teams, and most importantly, I've seen firsthand how education can change perspectives. Watching a kindergartener's eyes light up when they understand photosynthesis makes every hour worth it.",
    image: "👧",
    date: "February 2024",
  },
  {
    id: 4,
    type: "principal",
    name: "Dr. Robert Johnson",
    role: "Principal, Oak Ridge Middle School",
    story: "In 15 years as an educator, I've rarely seen students as engaged as they were during GSV's climate change presentation. The blend of peer-to-peer teaching and hands-on activities created an environment where even our most reluctant learners participated enthusiastically. We've now made GSV an annual partner for our 7th grade science curriculum.",
    image: "👨‍💼",
    date: "November 2023",
  },
  {
    id: 5,
    type: "parent",
    name: "Maria Santos",
    role: "Parent of 3rd Grader",
    story: "My daughter came home from the GSV presentation and immediately started sorting our recycling. She taught us about composting and convinced us to start a garden. It's incredible how one hour with passionate young educators sparked a lifestyle change for our entire family. Thank you GSV!",
    image: "👩",
    date: "April 2024",
  },
  {
    id: 6,
    type: "intern",
    name: "David Kim",
    role: "Technology Department Intern",
    story: "Leading the Technology Department has taught me more than any class could. I've built systems used by dozens of volunteers, analyzed data to improve our impact, and collaborated with founders on strategic decisions. The responsibility is real, the impact is measurable, and the experience is invaluable for my future career in tech.",
    image: "👨‍💻",
    date: "December 2023",
  },
];

export default function SuccessStories() {
  const [selectedType, setSelectedType] = useState<string>("all");

  const filteredStories = selectedType === "all" 
    ? stories 
    : stories.filter(s => s.type === selectedType);

  const types = [
    { value: "all", label: "All Stories" },
    { value: "teacher", label: "Teachers" },
    { value: "student", label: "Students" },
    { value: "volunteer", label: "Volunteers" },
    { value: "intern", label: "Interns" },
    { value: "principal", label: "Administrators" },
    { value: "parent", label: "Parents" },
  ];

  return (
    <div className="space-y-6">
      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {types.map((type) => (
          <button
            key={type.value}
            onClick={() => setSelectedType(type.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              selectedType === type.value
                ? "bg-gsv-green text-white"
                : "bg-gray-100 text-gsv-gray hover:bg-gray-200"
            }`}
          >
            {type.label}
          </button>
        ))}
      </div>

      {/* Stories Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {filteredStories.map((story) => (
          <div key={story.id} className="card p-6 hover:shadow-lg transition-shadow">
            <Quote className="w-8 h-8 text-gsv-green mb-4" />
            <p className="text-gsv-gray italic mb-6 leading-relaxed">“{story.story}”</p>
            <div className="flex items-center gap-3 border-t pt-4">
              <div className="text-3xl">{story.image}</div>
              <div>
                <div className="font-semibold text-gsv-charcoal">{story.name}</div>
                <div className="text-sm text-gsv-gray">{story.role}</div>
                <div className="text-xs text-gsv-gray mt-1">{story.date}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


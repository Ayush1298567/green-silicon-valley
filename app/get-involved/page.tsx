"use client";

import { useState } from "react";
import Link from "next/link";
import TeacherRequestForm from "@/components/forms/TeacherRequestForm";
import VolunteerSignupForm from "@/components/forms/VolunteerSignupForm";

export default function GetInvolvedPage() {
  const [activeTab, setActiveTab] = useState<"volunteer" | "intern" | "teacher" | null>(null);

  if (activeTab === "volunteer") {
    return (
      <div className="container py-14">
        <button
          onClick={() => setActiveTab(null)}
          className="mb-4 text-gsv-green hover:underline"
        >
          ← Back to Get Involved
        </button>
        <VolunteerSignupForm />
      </div>
    );
  }

  if (activeTab === "teacher") {
    return (
      <div className="container py-14">
        <button
          onClick={() => setActiveTab(null)}
          className="mb-4 text-gsv-green hover:underline"
        >
          ← Back to Get Involved
        </button>
        <TeacherRequestForm />
      </div>
    );
  }

  return (
    <div className="container py-14">
      <h1 className="text-3xl font-bold">Get Involved</h1>
      <p className="mt-3 text-gsv-gray max-w-2xl">
        Join us as a volunteer or intern. Teachers can request a presentation
        and we'll reach out with scheduling details.
      </p>
      <div className="grid md:grid-cols-3 gap-6 mt-8">
        <div className="card p-6 hover:shadow-lg transition cursor-pointer" onClick={() => setActiveTab("volunteer")}>
          <h2 className="font-semibold text-lg mb-2">Volunteer Sign-up</h2>
          <p className="text-sm text-gsv-gray mb-4">
            Join a group of 3-7 high school students to create and deliver STEM presentations.
          </p>
          <button className="rounded-lg bg-gsv-green px-4 py-2 text-white w-full">Start Application</button>
        </div>
        <div className="card p-6">
          <h2 className="font-semibold text-lg mb-2">Intern Application</h2>
          <p className="text-sm text-gsv-gray mb-4">
            Join one of our departments: Media, Technology, Outreach, Operations, Volunteer Development, or Communications.
          </p>
          <form className="mt-4 grid gap-3" action="/api/forms/intern" method="post">
            <input className="border rounded-lg px-3 py-2" name="name" placeholder="Full name" required />
            <input className="border rounded-lg px-3 py-2" name="email" placeholder="Email" type="email" required />
            <select className="border rounded-lg px-3 py-2" name="department" required>
              <option value="">Department</option>
              <option>Media</option>
              <option>Technology</option>
              <option>Outreach</option>
              <option>Operations</option>
              <option>Volunteer Development</option>
              <option>Communications</option>
            </select>
            <button className="rounded-lg bg-gsv-green px-4 py-2 text-white">Apply</button>
          </form>
        </div>
        <div className="card p-6 hover:shadow-lg transition cursor-pointer" onClick={() => setActiveTab("teacher")}>
          <h2 className="font-semibold text-lg mb-2">Teacher Request</h2>
          <p className="text-sm text-gsv-gray mb-4">
            Request a classroom presentation or join our teacher mailing list.
          </p>
          <button className="rounded-lg bg-gsv-green px-4 py-2 text-white w-full">Request Presentation</button>
        </div>
      </div>
    </div>
  );
}



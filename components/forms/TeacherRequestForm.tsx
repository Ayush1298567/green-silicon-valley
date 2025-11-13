"use client";

import { useState } from "react";

export default function TeacherRequestForm() {
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess(false);

    const formData = new FormData(e.currentTarget);
    
    // Collect preferred months
    const preferredMonths: string[] = [];
    const monthCheckboxes = e.currentTarget.querySelectorAll<HTMLInputElement>('input[name="preferred_months"]:checked');
    monthCheckboxes.forEach((cb) => preferredMonths.push(cb.value));

    // Collect topic interests
    const topicInterests: string[] = [];
    const topicCheckboxes = e.currentTarget.querySelectorAll<HTMLInputElement>('input[name="topic_interests"]:checked');
    topicCheckboxes.forEach((cb) => topicInterests.push(cb.value));

    const data = {
      full_name: formData.get("full_name"),
      school_name: formData.get("school_name"),
      grade_levels: formData.get("grade_levels"),
      email: formData.get("email"),
      request_type: formData.get("request_type"),
      preferred_months: preferredMonths,
      topic_interests: topicInterests,
      classroom_needs: formData.get("classroom_needs") || null,
      additional_notes: formData.get("additional_notes") || null,
    };

    try {
      const response = await fetch("/api/forms/teacher", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to submit form");
      }

      setSuccess(true);
      e.currentTarget.reset();
    } catch (err: any) {
      setError(err.message || "An error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="card p-6 max-w-xl">
        <div className="text-center">
          <div className="text-4xl mb-4">✓</div>
          <h2 className="text-2xl font-bold text-gsv-green mb-2">Thank You!</h2>
          <p className="text-gsv-gray mb-4">
            Your request has been submitted successfully. Our outreach team will contact you soon.
          </p>
          <button
            onClick={() => setSuccess(false)}
            className="text-gsv-green hover:underline"
          >
            Submit Another Request
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="card p-6 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Teacher Partnership & Waitlist Form</h1>
        <p className="text-gsv-gray">
          Thank you for your interest in partnering with Green Silicon Valley!
        </p>
        <p className="text-sm text-gsv-gray mt-2">
          Green Silicon Valley (GSV) is a student-led nonprofit that connects high school students 
          with local schools to lead fun, hands-on STEM presentations focused on environmental 
          science and sustainability.
        </p>
        <p className="text-sm text-gsv-gray mt-2">
          Please fill out this short form if you'd like to:
        </p>
        <ul className="list-disc list-inside text-sm text-gsv-gray mt-2 ml-4">
          <li>Host a classroom presentation this year</li>
          <li>Join our teacher mailing list</li>
          <li>Be added to our waitlist for upcoming programs</li>
        </ul>
        <p className="text-sm text-gsv-gray mt-2 font-medium">
          Our outreach team will contact you soon.
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="full_name"
            required
            className="w-full border rounded-lg px-3 py-2"
            placeholder="Please enter your first and last name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            School Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="school_name"
            required
            className="w-full border rounded-lg px-3 py-2"
            placeholder="Include your school and district if applicable"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Grade Level(s) You Teach <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="grade_levels"
            required
            className="w-full border rounded-lg px-3 py-2"
            placeholder="Example: 4th Grade Science, 7th–8th STEM, etc."
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Email Address <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            name="email"
            required
            className="w-full border rounded-lg px-3 py-2"
            placeholder="your.email@school.org"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Would you like to… <span className="text-red-500">*</span>
          </label>
          <select
            name="request_type"
            required
            className="w-full border rounded-lg px-3 py-2"
          >
            <option value="">Select an option</option>
            <option value="presentation">Host a classroom presentation</option>
            <option value="mailing_list">Join the GSV teacher mailing list</option>
            <option value="both">Both</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Preferred Months for Presentation
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {["November", "December", "January", "February", "March", "April", "May", "Flexible / Anytime"].map((month) => (
              <label key={month} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  name="preferred_months"
                  value={month}
                  className="rounded"
                />
                <span>{month}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Presentation Topics You're Most Interested In
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {[
              "Renewable Energy",
              "Climate Change & Sustainability",
              "Pollution & Environmental Cleanup",
              "Ecosystems & Biodiversity",
              "Water Conservation & Environmental Engineering",
              "Open to Anything"
            ].map((topic) => (
              <label key={topic} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  name="topic_interests"
                  value={topic}
                  className="rounded"
                />
                <span>{topic}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Any specific classroom needs or grade focus?
          </label>
          <textarea
            name="classroom_needs"
            rows={3}
            className="w-full border rounded-lg px-3 py-2"
            placeholder="Tell us if there's a specific grade, topic, or time that works best."
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Anything else you'd like us to know?
          </label>
          <textarea
            name="additional_notes"
            rows={3}
            className="w-full border rounded-lg px-3 py-2"
            placeholder="Additional information..."
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-gsv-green px-6 py-3 text-white font-medium hover:bg-gsv-greenDark transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? "Submitting..." : "Submit Request"}
        </button>
      </form>
    </div>
  );
}


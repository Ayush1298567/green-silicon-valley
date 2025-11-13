"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";

const testimonials = [
  {
    quote: "The GSV presentation was the highlight of our week! The students were so engaged and excited about learning environmental science.",
    author: "Ms. Johnson",
    role: "5th Grade Teacher, Lincoln Elementary",
    type: "teacher",
  },
  {
    quote: "Volunteering with GSV helped me develop my teaching and leadership skills. It's amazing to see young students get excited about sustainability!",
    author: "Emily Chen",
    role: "GSV Volunteer",
    type: "volunteer",
  },
  {
    quote: "I learned so much about recycling and climate change! Now I want to help save the planet.",
    author: "Alex",
    role: "4th Grade Student",
    type: "student",
  },
  {
    quote: "The volunteers were professional, knowledgeable, and great with kids. We look forward to hosting GSV presentations every year.",
    author: "Principal Martinez",
    role: "Washington Middle School",
    type: "teacher",
  },
  {
    quote: "Being part of GSV taught me how to communicate complex scientific concepts to younger audiences. It's been invaluable for my personal growth.",
    author: "David Park",
    role: "GSV Media Director",
    type: "volunteer",
  },
];

export default function TestimonialsCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const goToPrevious = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const goToNext = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const currentTestimonial = testimonials[currentIndex];

  return (
    <div className="relative max-w-4xl mx-auto">
      <div className="card p-8 md:p-12 shadow-lg">
        <Quote className="w-12 h-12 text-gsv-green/20 mb-4" />
        
        <blockquote className="text-lg md:text-xl text-gsv-charcoal italic mb-6 leading-relaxed">
          “{currentTestimonial.quote}”
        </blockquote>
        
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gsv-greenSoft flex items-center justify-center text-gsv-green font-semibold text-lg">
            {currentTestimonial.author[0]}
          </div>
          <div>
            <div className="font-semibold text-gsv-charcoal">{currentTestimonial.author}</div>
            <div className="text-sm text-gsv-gray">{currentTestimonial.role}</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-center gap-4 mt-6">
        <button
          onClick={goToPrevious}
          className="p-2 rounded-full border border-gray-300 hover:bg-gray-50 transition"
          aria-label="Previous testimonial"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="flex gap-2">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setIsAutoPlaying(false);
                setCurrentIndex(index);
              }}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentIndex
                  ? "bg-gsv-green w-8"
                  : "bg-gray-300 hover:bg-gray-400"
              }`}
              aria-label={`Go to testimonial ${index + 1}`}
            />
          ))}
        </div>

        <button
          onClick={goToNext}
          className="p-2 rounded-full border border-gray-300 hover:bg-gray-50 transition"
          aria-label="Next testimonial"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}


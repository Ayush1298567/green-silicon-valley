export interface Testimonial {
  id: string;
  studentName: string;
  studentAge?: number;
  schoolName: string;
  schoolCity: string;
  schoolState: string;
  grade: string;
  testimonial: string;
  impact: string;
  volunteerName?: string;
  presentationDate: string;
  featured: boolean;
  verified: boolean;
  rating: number; // 1-5 stars
  categories: string[]; // e.g., ['science', 'environment', 'hands-on', 'inspiring']
  imageUrl?: string;
  videoUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TestimonialStats {
  totalTestimonials: number;
  averageRating: number;
  verifiedTestimonials: number;
  schoolsReached: number;
  studentsImpacted: number;
  categoriesBreakdown: Record<string, number>;
  recentTestimonials: Testimonial[];
}

// Sample testimonials data - in production, this would come from database
export const sampleTestimonials: Testimonial[] = [
  {
    id: "1",
    studentName: "Emma Chen",
    studentAge: 10,
    schoolName: "Lincoln Elementary School",
    schoolCity: "Palo Alto",
    schoolState: "CA",
    grade: "4th Grade",
    testimonial: "The environmental science presentation was amazing! I learned so much about climate change and what I can do to help our planet. Now I recycle everything and tell my friends to do the same!",
    impact: "Emma started a recycling club at her school and convinced her family to switch to reusable water bottles.",
    volunteerName: "Sarah Johnson",
    presentationDate: "2024-01-15",
    featured: true,
    verified: true,
    rating: 5,
    categories: ["environment", "climate-change", "leadership", "family-impact"],
    imageUrl: "/testimonials/emma-chen.jpg",
    createdAt: "2024-01-16T10:30:00Z",
    updatedAt: "2024-01-16T10:30:00Z"
  },
  {
    id: "2",
    studentName: "Marcus Rodriguez",
    studentAge: 12,
    schoolName: "Oak Grove Middle School",
    schoolCity: "Sunnyvale",
    schoolState: "CA",
    grade: "7th Grade",
    testimonial: "I never thought science could be this fun! The hands-on experiments with solar power and wind energy were incredible. I want to be an environmental engineer when I grow up.",
    impact: "Marcus built a small wind turbine model at home and presented it to his class.",
    volunteerName: "David Kim",
    presentationDate: "2024-01-20",
    featured: true,
    verified: true,
    rating: 5,
    categories: ["renewable-energy", "hands-on", "career-inspiration", "engineering"],
    videoUrl: "/testimonials/marcus-rodriguez.mp4",
    createdAt: "2024-01-22T14:15:00Z",
    updatedAt: "2024-01-22T14:15:00Z"
  },
  {
    id: "3",
    studentName: "Aisha Patel",
    studentAge: 9,
    schoolName: "Washington Elementary",
    schoolCity: "Mountain View",
    schoolState: "CA",
    grade: "3rd Grade",
    testimonial: "The volunteers showed us how plastic in the ocean hurts sea turtles and fish. Now I never use plastic straws and I pick up litter at the park!",
    impact: "Aisha organized a neighborhood clean-up event and convinced 15 families to reduce plastic use.",
    volunteerName: "Maria Gonzalez",
    presentationDate: "2024-01-10",
    featured: true,
    verified: true,
    rating: 5,
    categories: ["ocean-pollution", "community-action", "plastic-reduction", "animal-welfare"],
    createdAt: "2024-01-12T09:45:00Z",
    updatedAt: "2024-01-12T09:45:00Z"
  },
  {
    id: "4",
    studentName: "Liam Thompson",
    studentAge: 11,
    schoolName: "Jefferson Intermediate",
    schoolCity: "Cupertino",
    schoolState: "CA",
    grade: "5th Grade",
    testimonial: "Learning about ecosystems was my favorite part! I didn't know that everything in nature is connected. The food web activity helped me understand how important every animal and plant is.",
    impact: "Liam created a school garden project and taught other students about local ecosystems.",
    volunteerName: "Jennifer Wu",
    presentationDate: "2024-01-08",
    featured: false,
    verified: true,
    rating: 5,
    categories: ["ecosystems", "biodiversity", "education", "school-projects"],
    createdAt: "2024-01-10T16:20:00Z",
    updatedAt: "2024-01-10T16:20:00Z"
  },
  {
    id: "5",
    studentName: "Sophia Nguyen",
    studentAge: 13,
    schoolName: "Roosevelt Middle School",
    schoolCity: "Fremont",
    schoolState: "CA",
    grade: "8th Grade",
    testimonial: "The presentation on water conservation changed how I think about our water supply. I started taking shorter showers and fixed leaks in our house. Every drop counts!",
    impact: "Sophia led a water conservation campaign at school, reducing water usage by 25% in one month.",
    volunteerName: "Robert Davis",
    presentationDate: "2024-01-25",
    featured: true,
    verified: true,
    rating: 5,
    categories: ["water-conservation", "leadership", "school-campaign", "practical-action"],
    createdAt: "2024-01-27T11:00:00Z",
    updatedAt: "2024-01-27T11:00:00Z"
  },
  {
    id: "6",
    studentName: "Jackson Lee",
    studentAge: 8,
    schoolName: "Madison Elementary",
    schoolCity: "Milpitas",
    schoolState: "CA",
    grade: "2nd Grade",
    testimonial: "I loved the experiments! Making volcanoes and seeing how plants grow was so cool. Science is my new favorite subject!",
    impact: "Jackson became excited about science and regularly conducts simple experiments at home.",
    volunteerName: "Lisa Chen",
    presentationDate: "2024-01-18",
    featured: false,
    verified: true,
    rating: 5,
    categories: ["hands-on-experiments", "science-excitement", "young-learners", "home-learning"],
    createdAt: "2024-01-20T13:30:00Z",
    updatedAt: "2024-01-20T13:30:00Z"
  }
];

export const getTestimonialStats = (): TestimonialStats => {
  const testimonials = sampleTestimonials;
  const verifiedTestimonials = testimonials.filter(t => t.verified);
  const schools = new Set(testimonials.map(t => t.schoolName));
  const categoriesBreakdown: Record<string, number> = {};

  testimonials.forEach(testimonial => {
    testimonial.categories.forEach(category => {
      categoriesBreakdown[category] = (categoriesBreakdown[category] || 0) + 1;
    });
  });

  const recentTestimonials = testimonials
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return {
    totalTestimonials: testimonials.length,
    averageRating: testimonials.reduce((sum, t) => sum + t.rating, 0) / testimonials.length,
    verifiedTestimonials: verifiedTestimonials.length,
    schoolsReached: schools.size,
    studentsImpacted: testimonials.length,
    categoriesBreakdown,
    recentTestimonials
  };
};

export const getFeaturedTestimonials = (): Testimonial[] => {
  return sampleTestimonials.filter(t => t.featured);
};

export const getTestimonialsByCategory = (category: string): Testimonial[] => {
  return sampleTestimonials.filter(t => t.categories.includes(category));
};

export const getTestimonialsBySchool = (schoolName: string): Testimonial[] => {
  return sampleTestimonials.filter(t =>
    t.schoolName.toLowerCase().includes(schoolName.toLowerCase())
  );
};

export const searchTestimonials = (query: string): Testimonial[] => {
  const lowercaseQuery = query.toLowerCase();
  return sampleTestimonials.filter(t =>
    t.studentName.toLowerCase().includes(lowercaseQuery) ||
    t.schoolName.toLowerCase().includes(lowercaseQuery) ||
    t.testimonial.toLowerCase().includes(lowercaseQuery) ||
    t.categories.some(cat => cat.toLowerCase().includes(lowercaseQuery))
  );
};

/* eslint-disable no-console */
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createSampleContent() {
  console.log('Creating sample content...');

  try {
    // Create sample blog posts
    console.log('Creating sample blog posts...');
    const blogPosts = [
      {
        title: "Empowering Students Through Environmental STEM Education",
        slug: "empowering-students-environmental-stem",
        content: "At Green Silicon Valley, we believe that every student deserves access to quality environmental education. Our peer-to-peer presentations bring complex scientific concepts to life through hands-on learning experiences.",
        excerpt: "Discover how we're transforming environmental education through innovative STEM programs.",
        category: "Education",
        cover_image: "/api/placeholder/800/400",
        published: true,
        author_name: "Green Silicon Valley Team"
      },
      {
        title: "The Impact of Student-Led Environmental Initiatives",
        slug: "impact-student-led-environmental-initiatives",
        content: "When students take ownership of environmental projects, the impact is profound. Our volunteer program has reached over 500 elementary and middle school students this year alone.",
        excerpt: "Learn about the measurable impact of student-led environmental education programs.",
        category: "Impact",
        cover_image: "/api/placeholder/800/400",
        published: true,
        author_name: "Green Silicon Valley Team"
      },
      {
        title: "Building Tomorrow's Environmental Leaders",
        slug: "building-tomorrows-environmental-leaders",
        content: "Through our comprehensive training program, high school volunteers develop leadership skills while making a real difference in their communities.",
        excerpt: "How we're cultivating the next generation of environmental leaders.",
        category: "Leadership",
        cover_image: "/api/placeholder/800/400",
        published: true,
        author_name: "Green Silicon Valley Team"
      }
    ];

    for (const post of blogPosts) {
      const { error } = await supabase
        .from('blog_posts')
        .upsert(post, { onConflict: 'slug' });

      if (error) console.error('Error creating blog post:', error);
    }

    // Create testimonials
    console.log('Creating testimonials...');
    const testimonials = [
      {
        name: "Sarah Johnson",
        role: "Elementary School Teacher",
        school: "Maple Elementary School",
        content: "The Green Silicon Valley presentations have transformed how my students think about environmental issues. The volunteer presenters are knowledgeable, enthusiastic, and genuinely care about making a difference.",
        rating: 5,
        featured: true
      },
      {
        name: "Michael Chen",
        role: "Middle School Science Teacher",
        school: "Cedar Middle School",
        content: "I've seen a remarkable increase in student engagement with environmental topics since we started the Green Silicon Valley program. The students are asking better questions and showing genuine interest in sustainability.",
        rating: 5,
        featured: true
      },
      {
        name: "Emily Rodriguez",
        role: "High School Volunteer",
        school: "Silicon Valley High",
        content: "Being a Green Silicon Valley volunteer has been one of the most rewarding experiences of my high school career. I've learned so much while helping younger students discover their passion for environmental science.",
        rating: 5,
        featured: true
      }
    ];

    for (const testimonial of testimonials) {
      const { error } = await supabase
        .from('testimonials')
        .upsert(testimonial, { onConflict: 'name,role' });

      if (error) console.error('Error creating testimonial:', error);
    }

    // Create sample partners
    console.log('Creating partner organizations...');
    const partners = [
      { name: "California Department of Education", logo_url: "/api/placeholder/200/100", website: "https://www.cde.ca.gov" },
      { name: "Silicon Valley Education Foundation", logo_url: "/api/placeholder/200/100", website: "https://www.svefoundation.org" },
      { name: "Environmental Science Alliance", logo_url: "/api/placeholder/200/100", website: "https://www.environmentalscience.org" }
    ];

    for (const partner of partners) {
      const { error } = await supabase
        .from('partners')
        .upsert(partner, { onConflict: 'name' });

      if (error) console.error('Error creating partner:', error);
    }

    // Create sample programs
    console.log('Creating program information...');
    const programs = [
      {
        title: "Environmental STEM Workshops",
        description: "Hands-on workshops covering climate science, renewable energy, and sustainable living practices.",
        icon: "🌱",
        features: ["Interactive demonstrations", "Take-home materials", "Follow-up resources"],
        duration: "60-90 minutes",
        audience: "Grades 3-8"
      },
      {
        title: "Climate Action Presentations",
        description: "Comprehensive presentations on climate change, its impacts, and actionable solutions for students.",
        icon: "🌍",
        features: ["Data-driven content", "Local impact focus", "Actionable takeaways"],
        duration: "45-60 minutes",
        audience: "Grades 6-12"
      },
      {
        title: "Sustainable Technology Showcase",
        description: "Showcase of emerging green technologies and their role in combating climate change.",
        icon: "⚡",
        features: ["Latest innovations", "Real-world applications", "Career exploration"],
        duration: "50-70 minutes",
        audience: "Grades 9-12"
      }
    ];

    for (const program of programs) {
      const { error } = await supabase
        .from('programs')
        .upsert(program, { onConflict: 'title' });

      if (error) console.error('Error creating program:', error);
    }

    console.log('✅ Sample content created successfully!');

  } catch (error) {
    console.error('Error creating sample content:', error);
    process.exit(1);
  }
}

createSampleContent();

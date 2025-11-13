"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { Leaf, Recycle, GraduationCap, Lightbulb, ArrowRight, CheckCircle2 } from "lucide-react";

const programs = [
  {
    icon: Leaf,
    title: "Environmental Science",
    description: "Hands-on activities exploring ecosystems, biodiversity, and conservation through interactive experiments and field observations.",
    features: [
      "Ecosystem exploration",
      "Biodiversity studies",
      "Conservation practices",
      "Field observations"
    ],
    color: "gsv-green",
    gradient: "from-gsv-green to-gsv-greenDark"
  },
  {
    icon: Recycle,
    title: "Sustainability & Climate",
    description: "Interactive lessons on waste reduction, renewable energy, and sustainable living with real-world applications.",
    features: [
      "Waste reduction strategies",
      "Renewable energy basics",
      "Sustainable living tips",
      "Carbon footprint analysis"
    ],
    color: "gsv-warm",
    gradient: "from-gsv-warm to-gsv-warmDark"
  },
  {
    icon: GraduationCap,
    title: "Student Leadership",
    description: "Training high school volunteers in communication, teaching, and project management skills for environmental advocacy.",
    features: [
      "Public speaking skills",
      "Teaching techniques",
      "Project management",
      "Community organizing"
    ],
    color: "accent-blue",
    gradient: "from-blue-500 to-blue-700"
  }
];

export default function ProgramsShowcase() {
  return (
    <section className="py-24 bg-white">
      <div className="container">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gsv-warm/10 text-gsv-warm text-sm font-semibold rounded-full border border-gsv-warm/20 mb-6">
            <Lightbulb className="w-4 h-4" />
            <span>What We Offer</span>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gsv-charcoal mb-6">
            Our Programs
          </h2>
          <p className="text-xl text-gsv-slate-600 max-w-3xl mx-auto leading-relaxed">
            Interactive, hands-on presentations designed to inspire the next generation 
            of environmental leaders through peer-to-peer learning.
          </p>
        </motion.div>

        {/* Programs Grid */}
        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          {programs.map((program, index) => (
            <motion.div
              key={program.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              whileHover={{ y: -12 }}
              className="group relative bg-white rounded-3xl shadow-soft hover:shadow-soft-xl transition-all duration-300 overflow-hidden"
            >
              {/* Gradient Header */}
              <div className={`relative h-48 bg-gradient-to-br ${program.gradient} p-8 flex items-center justify-center`}>
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute inset-0" style={{
                    backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
                    backgroundSize: '20px 20px'
                  }} />
                </div>

                {/* Icon */}
                <div className="relative z-10 w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <program.icon className="w-10 h-10 text-white" />
                </div>

                {/* Decorative Circle */}
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
              </div>

              {/* Content */}
              <div className="p-8">
                <h3 className="text-2xl font-bold text-gsv-charcoal mb-4 group-hover:text-gsv-green transition-colors">
                  {program.title}
                </h3>
                <p className="text-gsv-slate-600 leading-relaxed mb-6">
                  {program.description}
                </p>

                {/* Features List */}
                <ul className="space-y-3 mb-6">
                  {program.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <CheckCircle2 className={`w-5 h-5 text-${program.color} flex-shrink-0 mt-0.5`} />
                      <span className="text-sm text-gsv-slate-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* Learn More Link */}
                <Link
                  href="/programs"
                  className="inline-flex items-center gap-2 text-gsv-green font-semibold hover:gap-3 transition-all group/link"
                >
                  <span>Learn More</span>
                  <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                </Link>
              </div>

              {/* Hover Border Effect */}
              <div className={`absolute inset-0 border-2 border-transparent group-hover:border-${program.color}/20 rounded-3xl transition-colors pointer-events-none`} />
            </motion.div>
          ))}
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center"
        >
          <div className="inline-flex flex-col sm:flex-row gap-4">
            <Link
              href="/teachers/request"
              className="group px-8 py-4 bg-gsv-green text-white font-semibold rounded-xl hover:bg-gsv-greenDark transition-all hover:scale-105 inline-flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
            >
              <span>Request a Presentation</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/programs"
              className="group px-8 py-4 border-2 border-gsv-slate-300 text-gsv-charcoal font-semibold rounded-xl hover:border-gsv-green hover:text-gsv-green transition-all inline-flex items-center justify-center gap-2"
            >
              <span>View All Programs</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}


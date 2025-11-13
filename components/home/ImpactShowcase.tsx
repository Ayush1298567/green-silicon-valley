"use client";
import { motion } from "framer-motion";
import { TrendingUp, Users, School, Clock, Award, Target } from "lucide-react";
import AnimatedCounter from "@/components/ui/AnimatedCounter";

interface ImpactShowcaseProps {
  schoolsCount: number;
  volunteersCount: number;
  totalHours: number;
  presentationsCount: number;
}

export default function ImpactShowcase({
  schoolsCount,
  volunteersCount,
  totalHours,
  presentationsCount
}: ImpactShowcaseProps) {
  const stats = [
    {
      icon: School,
      value: schoolsCount,
      suffix: "+",
      label: "Schools Partnered",
      description: "Across the Bay Area",
      color: "text-gsv-green",
      bgColor: "bg-gsv-greenSoft"
    },
    {
      icon: Users,
      value: volunteersCount,
      suffix: "+",
      label: "Student Volunteers",
      description: "Making a difference",
      color: "text-gsv-warm",
      bgColor: "bg-gsv-warmSoft"
    },
    {
      icon: Clock,
      value: totalHours,
      suffix: "+",
      label: "Volunteer Hours",
      description: "Dedicated to education",
      color: "text-accent-blue",
      bgColor: "bg-blue-50"
    },
    {
      icon: Target,
      value: presentationsCount,
      suffix: "+",
      label: "Presentations Delivered",
      description: "Inspiring young minds",
      color: "text-accent-success",
      bgColor: "bg-green-50"
    }
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-white to-gsv-slate-100">
      <div className="container">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gsv-green/10 text-gsv-green text-sm font-semibold rounded-full border border-gsv-green/20 mb-6">
            <TrendingUp className="w-4 h-4" />
            <span>Our Impact</span>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gsv-charcoal mb-6">
            Making a Real Difference
          </h2>
          <p className="text-xl text-gsv-slate-600 max-w-3xl mx-auto leading-relaxed">
            Through peer-to-peer education, we’re inspiring the next generation 
            of environmental leaders across the Bay Area.
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="group relative bg-white rounded-2xl p-8 shadow-soft hover:shadow-soft-xl transition-all duration-300 overflow-hidden"
            >
              {/* Background Decoration */}
              <div className={`absolute top-0 right-0 w-32 h-32 ${stat.bgColor} rounded-full blur-3xl opacity-50 group-hover:opacity-70 transition-opacity`} />
              
              <div className="relative z-10">
                {/* Icon */}
                <div className={`w-14 h-14 ${stat.bgColor} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <stat.icon className={`w-7 h-7 ${stat.color}`} />
                </div>

                {/* Number */}
                <div className={`text-4xl md:text-5xl font-bold ${stat.color} mb-2`}>
                  <AnimatedCounter end={stat.value} suffix={stat.suffix} />
                </div>

                {/* Label */}
                <div className="text-lg font-semibold text-gsv-charcoal mb-1">
                  {stat.label}
                </div>

                {/* Description */}
                <div className="text-sm text-gsv-slate-600">
                  {stat.description}
                </div>
              </div>

              {/* Hover Effect Border */}
              <div className="absolute inset-0 border-2 border-transparent group-hover:border-gsv-green/20 rounded-2xl transition-colors" />
            </motion.div>
          ))}
        </div>

        {/* Featured Achievement */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="relative bg-gradient-to-br from-gsv-green to-gsv-greenDark rounded-3xl p-12 text-white overflow-hidden"
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
              backgroundSize: '30px 30px'
            }} />
          </div>

          {/* Decorative Blob */}
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />

          <div className="relative z-10 grid md:grid-cols-2 gap-8 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full mb-6">
                <Award className="w-4 h-4" />
                <span className="text-sm font-semibold">2024 Achievement</span>
              </div>
              <h3 className="text-3xl md:text-4xl font-bold mb-4">
                Recognized for Excellence in Environmental Education
              </h3>
              <p className="text-lg text-white/90 leading-relaxed">
                Our innovative peer-to-peer approach has reached thousands of students, 
                creating lasting impact in communities across the Bay Area.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                <div className="text-3xl font-bold mb-2">
                  <AnimatedCounter end={5000} suffix="+" />
                </div>
                <div className="text-sm text-white/80">Students Reached</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                <div className="text-3xl font-bold mb-2">
                  <AnimatedCounter end={95} suffix="%" />
                </div>
                <div className="text-sm text-white/80">Satisfaction Rate</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                <div className="text-3xl font-bold mb-2">
                  <AnimatedCounter end={12} suffix="+" />
                </div>
                <div className="text-sm text-white/80">School Districts</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                <div className="text-3xl font-bold mb-2">
                  <AnimatedCounter end={100} suffix="%" />
                </div>
                <div className="text-sm text-white/80">Free to Schools</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}


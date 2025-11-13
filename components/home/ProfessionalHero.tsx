"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Play, Sparkles } from "lucide-react";
import Lottie from "lottie-react";
import AnimatedCounter from "@/components/ui/AnimatedCounter";

interface HeroProps {
  schoolsCount: number;
  volunteersCount: number;
  presentationsCount: number;
}

export default function ProfessionalHero({
  schoolsCount,
  volunteersCount,
  presentationsCount
}: HeroProps) {
  const [animationData, setAnimationData] = useState<any>(null);

  useEffect(() => {
    let isMounted = true;
    fetch("https://assets8.lottiefiles.com/packages/lf20_0pnqz0.json")
      .then((res) => res.json())
      .then((data) => {
        if (isMounted) setAnimationData(data);
      })
      .catch(() => setAnimationData(null));
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-gsv-slate-900 via-gsv-slate-800 to-gsv-green">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }} />
      </div>

      {/* Decorative Blobs */}
      <div className="absolute top-20 right-20 w-96 h-96 bg-gsv-green/20 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 left-20 w-96 h-96 bg-gsv-warm/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />

      <div className="container relative z-10 py-20">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Column - Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-white space-y-8"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full"
            >
              <Sparkles className="w-4 h-4 text-gsv-warm" />
              <span className="text-sm font-semibold">Student-Led • Bay Area • Since 2020</span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight tracking-tight"
            >
              Empowering Students
              <span className="block mt-2 text-transparent bg-clip-text bg-gradient-to-r from-gsv-greenLight to-gsv-warm">
                Through Environmental STEM
              </span>
            </motion.h1>

            {/* Subtext */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-xl md:text-2xl text-gsv-slate-300 leading-relaxed max-w-2xl"
            >
              High school volunteers teaching elementary and middle school students 
              about sustainability through hands-on, peer-to-peer presentations.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-4 pt-4"
            >
              <Link
                href="/get-involved"
                className="group relative px-8 py-4 bg-gsv-green text-white font-semibold rounded-xl overflow-hidden transition-all hover:scale-105 hover:shadow-glow-green inline-flex items-center justify-center gap-2"
              >
                <span className="relative z-10">Become a Volunteer</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                <div className="absolute inset-0 bg-gradient-to-r from-gsv-greenDark to-gsv-green opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>

              <Link
                href="/teachers/request"
                className="group px-8 py-4 border-2 border-white/30 backdrop-blur-sm text-white font-semibold rounded-xl hover:bg-white/10 transition-all inline-flex items-center justify-center gap-2"
              >
                <span>Request a Presentation</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>

            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex gap-8 pt-8 border-t border-white/20"
            >
              <div>
                <div className="text-3xl md:text-4xl font-bold text-gsv-greenLight">
                  <AnimatedCounter end={schoolsCount} suffix="+" />
                </div>
                <div className="text-sm text-gsv-slate-400 mt-1">Schools Reached</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold text-gsv-greenLight">
                  <AnimatedCounter end={volunteersCount} suffix="+" />
                </div>
                <div className="text-sm text-gsv-slate-400 mt-1">Active Volunteers</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold text-gsv-greenLight">
                  <AnimatedCounter end={presentationsCount} suffix="+" />
                </div>
                <div className="text-sm text-gsv-slate-400 mt-1">Presentations</div>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Column - Visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, rotate: 3 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="hidden lg:block relative"
          >
            <div className="relative aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl transform hover:rotate-2 transition-transform duration-500 bg-white/5 backdrop-blur">
              {animationData ? (
                <Lottie animationData={animationData} loop className="absolute inset-0" />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-gsv-green to-gsv-greenDark flex items-center justify-center">
                  <div className="text-center text-white p-8">
                    <Play className="w-20 h-20 mx-auto mb-4 opacity-80" />
                    <p className="text-lg font-semibold">Students Learning in Nature</p>
                    <p className="text-sm text-white/70 mt-2">Upload your hero animation or image</p>
                  </div>
                </div>
              )}

              <div className="absolute bottom-8 left-8 right-8 bg-white/95 backdrop-blur-sm p-6 rounded-2xl shadow-xl">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gsv-green rounded-full flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="font-bold text-gsv-charcoal">Making Real Impact</div>
                    <div className="text-sm text-gsv-slate-600">In communities across the Bay Area</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute -top-6 -right-6 w-32 h-32 bg-gsv-warm rounded-full blur-2xl opacity-50" />
            <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-gsv-greenLight rounded-full blur-2xl opacity-50" />
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <div className="flex flex-col items-center gap-2 text-white/50">
          <span className="text-xs font-medium">Scroll to explore</span>
          <div className="w-6 h-10 border-2 border-white/30 rounded-full p-1">
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-1 h-3 bg-white/50 rounded-full mx-auto"
            />
          </div>
        </div>
      </motion.div>
    </section>
  );
}


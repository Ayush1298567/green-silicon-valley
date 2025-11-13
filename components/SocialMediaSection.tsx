"use client";
import { motion } from "framer-motion";
import { Linkedin, Youtube, Instagram, MessageCircle, Twitter, Facebook } from "lucide-react";

interface SocialLink {
  name: string;
  icon: React.ReactNode;
  url: string;
  color: string;
  hoverColor: string;
}

const socialLinks: SocialLink[] = [
  {
    name: "LinkedIn",
    icon: <Linkedin className="w-6 h-6" />,
    url: "https://linkedin.com/company/green-silicon-valley",
    color: "bg-[#0A66C2]",
    hoverColor: "hover:bg-[#004182]"
  },
  {
    name: "YouTube",
    icon: <Youtube className="w-6 h-6" />,
    url: "https://youtube.com/@greensiliconvalley",
    color: "bg-[#FF0000]",
    hoverColor: "hover:bg-[#CC0000]"
  },
  {
    name: "Instagram",
    icon: <Instagram className="w-6 h-6" />,
    url: "https://instagram.com/greensiliconvalley",
    color: "bg-gradient-to-br from-[#833AB4] via-[#FD1D1D] to-[#F77737]",
    hoverColor: "hover:opacity-90"
  },
  {
    name: "Discord",
    icon: <MessageCircle className="w-6 h-6" />,
    url: "https://discord.gg/greensiliconvalley",
    color: "bg-[#5865F2]",
    hoverColor: "hover:bg-[#4752C4]"
  },
  {
    name: "Twitter",
    icon: <Twitter className="w-6 h-6" />,
    url: "https://twitter.com/greensiliconval",
    color: "bg-[#1DA1F2]",
    hoverColor: "hover:bg-[#1A8CD8]"
  },
  {
    name: "Facebook",
    icon: <Facebook className="w-6 h-6" />,
    url: "https://facebook.com/greensiliconvalley",
    color: "bg-[#1877F2]",
    hoverColor: "hover:bg-[#166FE5]"
  }
];

export default function SocialMediaSection() {
  return (
    <section className="py-16 bg-gradient-to-br from-gsv-slate-50 to-white">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gsv-green/10 text-gsv-green text-sm font-semibold rounded-full border border-gsv-green/20 mb-6">
            <span>🌐</span>
            <span>Connect With Us</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gsv-charcoal mb-4">
            Join Our Community
          </h2>
          <p className="text-xl text-gsv-slate-600 max-w-2xl mx-auto leading-relaxed">
            Follow us on social media for updates, stories, and behind-the-scenes content from our environmental education journey
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 max-w-5xl mx-auto">
          {socialLinks.map((social, index) => (
            <motion.a
              key={social.name}
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              whileHover={{ scale: 1.05, y: -8 }}
              whileTap={{ scale: 0.95 }}
              className={`group relative ${social.color} ${social.hoverColor} text-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col items-center justify-center gap-3 overflow-hidden`}
            >
              {/* Background Shine Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              {/* Icon */}
              <div className="relative z-10 transform group-hover:scale-110 transition-transform duration-300">
                {social.icon}
              </div>
              
              {/* Name */}
              <span className="relative z-10 text-sm font-semibold">
                {social.name}
              </span>

              {/* Hover Arrow */}
              <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </div>
            </motion.a>
          ))}
        </div>

        {/* Additional CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-12"
        >
          <p className="text-gsv-slate-600 mb-4">
            Stay updated with our latest presentations, volunteer opportunities, and environmental initiatives
          </p>
          <div className="flex flex-wrap justify-center gap-3 text-sm">
            <span className="px-4 py-2 bg-gsv-greenSoft text-gsv-green rounded-full font-medium">
              📸 Weekly Updates
            </span>
            <span className="px-4 py-2 bg-gsv-warmSoft text-gsv-warm rounded-full font-medium">
              🎥 Event Highlights
            </span>
            <span className="px-4 py-2 bg-blue-50 text-accent-blue rounded-full font-medium">
              💬 Community Discussions
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}


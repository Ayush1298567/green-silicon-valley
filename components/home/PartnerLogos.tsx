"use client";

import Image from "next/image";

// This component displays partner logos
// In production, these would be fetched from the database or CMS
// Founders can manage partner logos through the page builder

const partners = [
  { name: "Santa Clara Unified School District", logo: null },
  { name: "Environmental Protection Agency", logo: null },
  { name: "Silicon Valley Community Foundation", logo: null },
  { name: "Tech for Good", logo: null },
  { name: "Green Earth Initiative", logo: null },
  { name: "Youth Leadership Program", logo: null },
];

export default function PartnerLogos() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
      {partners.map((partner, index) => (
        <div
          key={index}
          className="flex items-center justify-center p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
        >
          {partner.logo ? (
            <Image
              src={partner.logo}
              alt={partner.name}
              width={160}
              height={48}
              className="max-w-full h-12 object-contain grayscale hover:grayscale-0 transition-all"
            />
          ) : (
            <div className="text-center">
              <div className="text-2xl mb-1">🤝</div>
              <div className="text-xs text-gray-500 font-medium">{partner.name}</div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}


"use client";
import Link from "next/link";
import { Plus, Calendar, Users, FileText, Settings, MessageSquare, BarChart, BarChart3, Megaphone, Brain, Search, TrendingUp, Shield, Package, DollarSign } from "lucide-react";

export default function QuickActions() {
  const actions = [
    {
      href: "#ai-chat", // Open AI Chat
      icon: <Brain className="w-5 h-5" />,
      label: "AI Chat",
      color: "bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700",
      onClick: () => {
        // Dispatch custom event to open AI chat
        window.dispatchEvent(new CustomEvent('openAIChat'));
      }
    },
    {
      href: "#ai-stuck-groups", // Scroll to AI widget
      icon: <Brain className="w-5 h-5" />,
      label: "AI Insights",
      color: "bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700",
      onClick: () => document.getElementById('ai-insights-section')?.scrollIntoView({ behavior: 'smooth' })
    },
    {
      href: "#scheduling-assistant", // Scroll to scheduling widget
      icon: <Calendar className="w-5 h-5" />,
      label: "Smart Schedule",
      color: "bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700",
      onClick: () => document.getElementById('scheduling-assistant')?.scrollIntoView({ behavior: 'smooth' })
    },
    {
      href: "#global-search", // Focus search bar
      icon: <Search className="w-5 h-5" />,
      label: "AI Search",
      color: "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700",
      onClick: () => document.querySelector('input[placeholder*="Search"]')?.focus()
    },
    {
      href: "/dashboard/founder/reviews",
      icon: <FileText className="w-5 h-5" />,
      label: "Reviews",
      color: "bg-gsv-green hover:bg-gsv-greenDark"
    },
    {
      href: "/dashboard/founder/hours/pending",
      icon: <Calendar className="w-5 h-5" />,
      label: "Approve Hours",
      color: "bg-blue-500 hover:bg-blue-600"
    },
    {
      href: "/dashboard/founder/applications",
      icon: <MessageSquare className="w-5 h-5" />,
      label: "Applications",
      color: "bg-purple-500 hover:bg-purple-600"
    },
    {
      href: "/admin/teachers",
      icon: <Users className="w-5 h-5" />,
      label: "Teacher Mgmt",
      color: "bg-cyan-500 hover:bg-cyan-600"
    },
    {
      href: "/admin/finance",
      icon: <DollarSign className="w-5 h-5" />,
      label: "Budget Mgmt",
      color: "bg-emerald-500 hover:bg-emerald-600"
    },
    {
      href: "/admin/inventory",
      icon: <Package className="w-5 h-5" />,
      label: "Equipment",
      color: "bg-amber-500 hover:bg-amber-600"
    },
    {
      href: "/admin/safety",
      icon: <Shield className="w-5 h-5" />,
      label: "Safety",
      color: "bg-red-500 hover:bg-red-600"
    },
    {
      href: "/admin/user-manager",
      icon: <Users className="w-5 h-5" />,
      label: "Manage Users",
      color: "bg-slate-900 hover:bg-slate-800"
    },
    {
      href: "/admin/website-builder",
      icon: <Settings className="w-5 h-5" />,
      label: "Edit Website",
      color: "bg-gsv-warm hover:bg-gsv-warmDark"
    },
        {
          href: "/dashboard/founder/group-progress",
          icon: <Users className="w-5 h-5" />,
          label: "Group Progress",
          color: "bg-orange-500 hover:bg-orange-600"
        },
    {
      href: "/admin/blog",
      icon: <FileText className="w-5 h-5" />,
      label: "Blog Posts",
      color: "bg-purple-500 hover:bg-purple-600"
    },
    {
      href: "/admin/media-manager",
      icon: <FileText className="w-5 h-5" />,
      label: "Media Files",
      color: "bg-pink-500 hover:bg-pink-600"
    },
    {
      href: "/dashboard/founder/documents/pending",
      icon: <FileText className="w-5 h-5" />,
      label: "Review Docs",
      color: "bg-indigo-500 hover:bg-indigo-600"
    },
    {
      href: "/admin/marketing",
      icon: <Megaphone className="w-5 h-5" />,
      label: "Campaigns",
      color: "bg-orange-500 hover:bg-orange-600"
    },
    {
      href: "/dashboard/analytics",
      icon: <BarChart3 className="w-5 h-5" />,
      label: "Analytics",
      color: "bg-slate-900 hover:bg-slate-800"
    },
    {
      href: "/admin/data",
      icon: <BarChart className="w-5 h-5" />,
      label: "Data Manager",
      color: "bg-teal-500 hover:bg-teal-600"
    },
    {
      href: "/dashboard/founder/presentations/new",
      icon: <Calendar className="w-5 h-5" />,
      label: "Schedule Event",
      color: "bg-blue-500 hover:bg-blue-600"
    },
    {
      href: "/dashboard/founder/bulletin",
      icon: <MessageSquare className="w-5 h-5" />,
      label: "Post Bulletin",
      color: "bg-yellow-500 hover:bg-yellow-600"
    },
    {
      href: "/dashboard/founder/admin-settings",
      icon: <Shield className="w-5 h-5" />,
      label: "Admin Settings",
      color: "bg-red-500 hover:bg-red-600"
    },
    {
      href: "/dashboard/founder/material-requests",
      icon: <Package className="w-5 h-5" />,
      label: "Material Requests",
      color: "bg-emerald-500 hover:bg-emerald-600"
    }
  ];

  return (
    <div className="card p-6">
      <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {actions.map((action, idx) => (
          action.onClick ? (
            <button
              key={idx}
              onClick={action.onClick}
              className={`${action.color} text-white rounded-lg p-4 flex flex-col items-center justify-center gap-2 transition shadow-md hover:shadow-lg w-full`}
            >
              {action.icon}
              <span className="text-xs text-center font-medium leading-tight">{action.label}</span>
            </button>
          ) : (
            <Link
              key={idx}
              href={action.href as any}
              className={`${action.color} text-white rounded-lg p-4 flex flex-col items-center justify-center gap-2 transition shadow-md hover:shadow-lg`}
            >
              {action.icon}
              <span className="text-xs text-center font-medium leading-tight">{action.label}</span>
            </Link>
          )
        ))}
      </div>
    </div>
  );
}


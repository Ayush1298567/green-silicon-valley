"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Mail, Plus, Users, BarChart3, Send } from "lucide-react";

export default function NewsletterPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gsv-charcoal">Newsletter</h1>
          <p className="text-gsv-gray mt-1">Manage email campaigns and subscribers</p>
        </div>
        <Link
          href="/dashboard/founder/newsletter/campaigns/new"
          className="px-4 py-2 bg-gsv-green text-white rounded-lg hover:bg-gsv-greenDark flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New Campaign
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Link
          href="/dashboard/founder/newsletter/campaigns"
          className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Send className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gsv-charcoal">Campaigns</h3>
          </div>
          <p className="text-sm text-gsv-gray">Create and manage email campaigns</p>
        </Link>

        <Link
          href="/dashboard/founder/newsletter/subscribers"
          className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <Users className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="font-semibold text-gsv-charcoal">Subscribers</h3>
          </div>
          <p className="text-sm text-gsv-gray">Manage your subscriber list</p>
        </Link>

        <Link
          href="/dashboard/founder/newsletter/templates"
          className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Mail className="w-5 h-5 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gsv-charcoal">Templates</h3>
          </div>
          <p className="text-sm text-gsv-gray">Email templates library</p>
        </Link>

        <Link
          href="/dashboard/founder/newsletter/analytics"
          className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-orange-100 rounded-lg">
              <BarChart3 className="w-5 h-5 text-orange-600" />
            </div>
            <h3 className="font-semibold text-gsv-charcoal">Analytics</h3>
          </div>
          <p className="text-sm text-gsv-gray">Campaign performance metrics</p>
        </Link>
      </div>
    </div>
  );
}


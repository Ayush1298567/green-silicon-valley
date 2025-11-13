"use client";
import { useState } from "react";
import { format } from "date-fns";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { useToast } from "@/components/Toast";

const AUDIENCES = [
  { value: "all", label: "All Contacts" },
  { value: "volunteers", label: "Volunteers" },
  { value: "interns", label: "Interns" },
  { value: "teachers", label: "Teachers" },
  { value: "partners", label: "Partners" },
  { value: "founders", label: "Founders" }
];

const TYPES = [
  { value: "newsletter", label: "Newsletter" },
  { value: "event", label: "Event Reminder" },
  { value: "update", label: "Program Update" }
];

interface MarketingAutomationsPanelProps {
  initialCampaigns: any[];
  initialLogs: any[];
}

export default function MarketingAutomationsPanel({ initialCampaigns, initialLogs }: MarketingAutomationsPanelProps) {
  const { showToast } = useToast();
  const [campaigns, setCampaigns] = useState(initialCampaigns);
  const [logs, setLogs] = useState(initialLogs);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    campaignType: "newsletter",
    audience: "all",
    subject: "",
    body: "",
    sendAt: ""
  });

  const refreshCampaigns = async () => {
    const res = await fetch("/api/marketing/campaigns", { cache: "no-store" });
    if (!res.ok) return;
    const data = await res.json();
    setCampaigns(data.campaigns ?? []);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/marketing/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error ?? "Failed to create campaign");
      }
      showToast("Campaign created", "success");
      setForm({ title: "", campaignType: "newsletter", audience: "all", subject: "", body: "", sendAt: "" });
      await refreshCampaigns();
    } catch (error: any) {
      showToast(error?.message ?? "Unable to create campaign", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (id: string) => {
    setLoading(true);
    try {
      const res = await fetch("/api/marketing/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ campaignId: id })
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error ?? "Failed to send campaign");
      }
      const data = await res.json();
      if (Array.isArray(data.deliveries)) {
        setLogs((prev) => [
          ...data.deliveries.map((d: any) => ({
            campaign_id: id,
            status: d.status,
            detail: d.detail ?? null,
            created_at: new Date().toISOString() 
          })),
          ...prev
        ]);
      }
      showToast("Campaign sent", "success");
      await refreshCampaigns();
    } catch (error: any) {
      showToast(error?.message ?? "Unable to send campaign", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/marketing/campaigns/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "cancelled" })
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error ?? "Failed to cancel campaign");
      }
      showToast("Campaign cancelled", "info");
      await refreshCampaigns();
    } catch (error: any) {
      showToast(error?.message ?? "Unable to cancel campaign", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this campaign?")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/marketing/campaigns/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error ?? "Failed to delete campaign");
      }
      showToast("Campaign deleted", "warning");
      setCampaigns((prev) => prev.filter((c) => c.id !== id));
    } catch (error: any) {
      showToast(error?.message ?? "Unable to delete campaign", "error");
    } finally {
      setLoading(false);
    }
  };

  const upcomingCampaigns = campaigns.filter((c: any) => c.status === "draft" || c.status === "scheduled");
  const sentCampaigns = campaigns.filter((c: any) => c.status === "sent");
  const cancelledCampaigns = campaigns.filter((c: any) => c.status === "cancelled");

  const fieldClass = "w-full rounded-lg border border-gsv-slate-200 px-3 py-2 focus:ring-2 focus:ring-gsv-green/40 focus:border-gsv-green disabled:bg-gray-100";

  return (
    <div className="space-y-10">
      <ScrollReveal>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gsv-charcoal">Marketing Automations</h1>
            <p className="text-gsv-slate-600 mt-2 max-w-2xl">
              Schedule newsletters, event reminders, and program updates for your audiences. Campaigns support
              audience targeting, future scheduling, and delivery tracking.
            </p>
          </div>
        </div>
      </ScrollReveal>

      <ScrollReveal delay={0.05}>
        <form onSubmit={handleCreate} className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 card p-6 border border-gsv-slate-200/60 shadow-soft">
            <h2 className="text-lg font-semibold text-gsv-charcoal mb-4">Create Campaign</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase text-gsv-slate-500">Title</label>
                <input
                  type="text"
                  className={fieldClass}
                  value={form.title}
                  onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase text-gsv-slate-500">Campaign Type</label>
                <select
                  className={fieldClass}
                  value={form.campaignType}
                  onChange={(e) => setForm((prev) => ({ ...prev, campaignType: e.target.value }))}
                >
                  {TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase text-gsv-slate-500">Audience</label>
                <select
                  className={fieldClass}
                  value={form.audience}
                  onChange={(e) => setForm((prev) => ({ ...prev, audience: e.target.value }))}
                >
                  {AUDIENCES.map((audience) => (
                    <option key={audience.value} value={audience.value}>
                      {audience.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase text-gsv-slate-500">Send At (optional)</label>
                <input
                  type="datetime-local"
                  className={fieldClass}
                  value={form.sendAt}
                  onChange={(e) => setForm((prev) => ({ ...prev, sendAt: e.target.value }))}
                />
                <p className="text-[11px] text-gsv-slate-400">Leave blank to save as draft and send manually.</p>
              </div>
            </div>
            <div className="space-y-2 mt-4">
              <label className="text-xs font-semibold uppercase text-gsv-slate-500">Email Subject</label>
              <input
                type="text"
                className={fieldClass}
                value={form.subject}
                onChange={(e) => setForm((prev) => ({ ...prev, subject: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2 mt-4">
              <label className="text-xs font-semibold uppercase text-gsv-slate-500">Message Body</label>
              <textarea
                className={`${fieldClass} h-40`}
                value={form.body}
                onChange={(e) => setForm((prev) => ({ ...prev, body: e.target.value }))}
                placeholder="Share updates, reminders, or calls to action."
                required
              />
              <p className="text-[11px] text-gsv-slate-400">Emails send as plain text using your configured SMTP settings.</p>
            </div>
            <button
              type="submit"
              className="mt-6 inline-flex items-center justify-center rounded-xl bg-gsv-green px-5 py-2.5 text-white font-semibold shadow-soft hover:bg-gsv-greenDark disabled:opacity-60"
              disabled={loading}
            >
              {loading ? "Working..." : "Save Campaign"}
            </button>
          </div>

          <div className="space-y-6">
            <div className="card p-6 border border-gsv-slate-200/60 shadow-soft">
              <h3 className="text-md font-semibold text-gsv-charcoal mb-4">Tips</h3>
              <ul className="list-disc list-inside text-sm text-gsv-slate-600 space-y-2">
                <li>Use scheduled sends for event reminders or drip campaigns.</li>
                <li>Audience targeting ensures the right teams receive updates.</li>
                <li>Configure <code>SMTP_URL</code> to enable real email delivery.</li>
              </ul>
            </div>
          </div>
        </form>
      </ScrollReveal>

      <ScrollReveal delay={0.1}>
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gsv-charcoal">Upcoming Campaigns</h2>
            <span className="text-xs text-gsv-slate-500">Draft & Scheduled</span>
          </div>
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
            {upcomingCampaigns.map((campaign: any) => (
              <div key={campaign.id} className="rounded-2xl border border-gsv-slate-200/60 bg-white/70 backdrop-blur-sm p-5 shadow-soft">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gsv-charcoal">{campaign.title}</h3>
                    <p className="text-xs uppercase tracking-wide text-gsv-slate-400">{campaign.campaign_type}</p>
                  </div>
                  <span className="text-xs font-semibold text-gsv-slate-500 px-2 py-1 rounded-full bg-gsv-slate-100">
                    {campaign.status}
                  </span>
                </div>
                <div className="text-sm text-gsv-slate-600 mt-3">Audience: {campaign.audience}</div>
                {campaign.send_at ? (
                  <div className="text-xs text-gsv-slate-500 mt-1">
                    Scheduled for {format(new Date(campaign.send_at), "PPP p")}
                  </div>
                ) : (
                  <div className="text-xs text-gsv-slate-500 mt-1">Draft (no send date)</div>
                )}
                <div className="flex gap-2 mt-4">
                  <button
                    className="flex-1 rounded-lg bg-gsv-green text-white text-sm font-semibold py-2 hover:bg-gsv-greenDark disabled:opacity-60"
                    onClick={() => handleSend(campaign.id)}
                    disabled={loading}
                  >
                    Send Now
                  </button>
                  <button
                    className="rounded-lg border border-gsv-slate-300 text-sm font-semibold py-2 px-3 hover:bg-gsv-slate-100 disabled:opacity-60"
                    onClick={() => handleCancel(campaign.id)}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    className="rounded-lg border border-red-200 text-red-500 text-sm font-semibold py-2 px-3 hover:bg-red-50 disabled:opacity-60"
                    onClick={() => handleDelete(campaign.id)}
                    disabled={loading}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
            {upcomingCampaigns.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gsv-slate-300 bg-white/40 py-12 text-center text-sm text-gsv-slate-500">
                No upcoming campaigns. Create one using the form above.
              </div>
            ) : null}
          </div>
        </section>
      </ScrollReveal>

      <ScrollReveal delay={0.15}>
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gsv-charcoal">Sent Campaigns</h2>
            <span className="text-xs text-gsv-slate-500">Delivery history</span>
          </div>
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
            {sentCampaigns.map((campaign: any) => (
              <div key={campaign.id} className="rounded-2xl border border-gsv-slate-200/60 bg-white/70 backdrop-blur-sm p-5 shadow-soft">
                <div className="text-sm font-semibold text-gsv-charcoal">{campaign.title}</div>
                <div className="text-xs text-gsv-slate-500 mt-1">
                  Sent {campaign.sent_at ? format(new Date(campaign.sent_at), "PPP p") : "recently"}
                </div>
                <div className="text-xs text-gsv-slate-500 mt-2">Audience: {campaign.audience}</div>
                <div className="text-xs text-gsv-slate-500 mt-1">Subject: {campaign.subject}</div>
              </div>
            ))}
            {sentCampaigns.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gsv-slate-300 bg-white/40 py-12 text-center text-sm text-gsv-slate-500">
                Campaigns that you send will appear here.
              </div>
            ) : null}
          </div>
        </section>
      </ScrollReveal>

      {cancelledCampaigns.length > 0 ? (
        <ScrollReveal delay={0.2}>
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-gsv-charcoal">Cancelled Campaigns</h2>
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
              {cancelledCampaigns.map((campaign: any) => (
                <div key={campaign.id} className="rounded-2xl border border-gsv-slate-200/60 bg-white/60 p-5 shadow-inner-soft">
                  <div className="text-sm font-semibold text-gsv-charcoal">{campaign.title}</div>
                  <div className="text-xs text-gsv-slate-500 mt-1">Audience: {campaign.audience}</div>
                  <button
                    className="mt-3 text-xs font-semibold text-gsv-green hover:underline"
                    onClick={() => handleDelete(campaign.id)}
                    disabled={loading}
                  >
                    Delete Permanently
                  </button>
                </div>
              ))}
            </div>
          </section>
        </ScrollReveal>
      ) : null}

      <ScrollReveal delay={0.25}>
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gsv-charcoal">Delivery Logs</h2>
            <span className="text-xs text-gsv-slate-500">Most recent 100 entries</span>
          </div>
          <div className="overflow-x-auto rounded-2xl border border-gsv-slate-200/60 bg-white/70">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-gsv-slate-500">
                  <th className="px-4 py-3">Campaign</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Detail</th>
                  <th className="px-4 py-3">Time</th>
                </tr>
              </thead>
              <tbody>
                {logs.length > 0 ? (
                  logs.map((log, idx) => (
                    <tr key={idx} className="border-t border-gsv-slate-100">
                      <td className="px-4 py-3 text-gsv-charcoal text-xs">{log.campaign_id}</td>
                      <td className="px-4 py-3 text-xs capitalize text-gsv-slate-600">{log.status}</td>
                      <td className="px-4 py-3 text-xs text-gsv-slate-500">{log.detail ?? ""}</td>
                      <td className="px-4 py-3 text-xs text-gsv-slate-400">
                        {log.created_at ? format(new Date(log.created_at), "PPP p") : ""}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="px-4 py-8 text-center text-sm text-gsv-slate-500" colSpan={4}>
                      No delivery activity yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </ScrollReveal>
    </div>
  );
}

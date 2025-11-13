"use client";

interface TopListsProps {
  volunteers: Array<{ name: string; hours: number; team?: string | null }>;
  schools: Array<{ name: string; presentations: number; students?: number }>;
}

export default function TopLists({ volunteers, schools }: TopListsProps) {
  return (
    <div className="grid md:grid-cols-2 gap-6 mt-6">
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gsv-charcoal">Top Volunteers</h3>
          <span className="text-xs uppercase tracking-wide text-gsv-slate-400">Last 90 days</span>
        </div>
        <ul className="space-y-3">
          {volunteers.slice(0, 6).map((volunteer, idx) => (
            <li key={volunteer.name + idx} className="flex items-center justify-between rounded-xl border border-gsv-slate-200/60 bg-white/60 px-3 py-2">
              <div>
                <div className="text-sm font-semibold text-gsv-charcoal">{volunteer.name}</div>
                {volunteer.team ? <div className="text-xs text-gsv-slate-500">{volunteer.team}</div> : null}
              </div>
              <div className="text-sm font-bold text-gsv-green">{volunteer.hours.toFixed(1)} hrs</div>
            </li>
          ))}
          {volunteers.length === 0 ? (
            <li className="text-sm text-gsv-slate-500 text-center py-6">No volunteer hours recorded yet.</li>
          ) : null}
        </ul>
      </div>
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gsv-charcoal">Top Schools</h3>
          <span className="text-xs uppercase tracking-wide text-gsv-slate-400">Presentations</span>
        </div>
        <ul className="space-y-3">
          {schools.slice(0, 6).map((school, idx) => (
            <li key={school.name + idx} className="flex items-center justify-between rounded-xl border border-gsv-slate-200/60 bg-white/60 px-3 py-2">
              <div>
                <div className="text-sm font-semibold text-gsv-charcoal">{school.name}</div>
                {typeof school.students === "number" ? (
                  <div className="text-xs text-gsv-slate-500">{school.students.toLocaleString()} students</div>
                ) : null}
              </div>
              <div className="text-sm font-bold text-gsv-green">{school.presentations} events</div>
            </li>
          ))}
          {schools.length === 0 ? (
            <li className="text-sm text-gsv-slate-500 text-center py-6">No presentations recorded yet.</li>
          ) : null}
        </ul>
      </div>
    </div>
  );
}

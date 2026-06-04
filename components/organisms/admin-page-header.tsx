import type { ReactNode } from "react";

export function AdminPageHeader({
  actions,
  eyebrow,
  icon,
  title,
  summary
}: {
  actions?: ReactNode;
  eyebrow?: string;
  icon?: ReactNode;
  title: string;
  summary?: string;
}) {
  return (
    <header className="flex flex-col gap-3 rounded-2xl border border-rawey-line bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div>
        {eyebrow ? <p className="text-xs font-bold uppercase text-rawey-gold">{eyebrow}</p> : null}
        <div className="flex items-center gap-2">
          {icon ? <span className="text-rawey-gold">{icon}</span> : null}
          <h2 className="text-2xl font-bold">{title}</h2>
        </div>
        {summary ? <p className="mt-1 text-sm text-rawey-muted">{summary}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </header>
  );
}

export function AdminStatCard({
  icon,
  label,
  value,
  note
}: {
  icon: ReactNode;
  label: string;
  value: string;
  note?: string;
}) {
  return (
    <div className="rounded-2xl border border-rawey-line bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-rawey-muted">{label}</p>
        <span className="rounded-full bg-rawey-gold/10 p-2 text-rawey-gold">{icon}</span>
      </div>
      <p className="mt-2 text-xl font-bold">{value}</p>
      {note ? <p className="mt-1 text-xs text-rawey-muted">{note}</p> : null}
    </div>
  );
}

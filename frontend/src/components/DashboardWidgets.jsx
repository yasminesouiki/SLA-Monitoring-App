import { useState } from "react";
import { formatDuration, formatNumber, STATUS_LABEL } from "../utils/dashboardFormat";

export const IconPhone = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
  </svg>
);
export const IconPhoneOff = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92v3a2 2 0 0 1-2.18 2A19.79 19.79 0 0 1 3.08 5.18 2 2 0 0 1 5 3h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11l-1.27 1.27"/>
    <line x1="23" y1="1" x2="1" y2="23"/>
  </svg>
);
export const IconTrophy = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0V4z"/>
    <path d="M5 4H3v2a4 4 0 0 0 4 4M19 4h2v2a4 4 0 0 1-4 4"/>
  </svg>
);
export const IconTrendUp = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
  </svg>
);
export const IconZap = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
  </svg>
);
export const IconGauge = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM12 3v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M18.4 5.6l-2.1 2.1"/>
  </svg>
);
export const IconClock = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);
export const IconChevron = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6"/>
  </svg>
);

export function StatCard({ icon, label, value, sub }) {
  return (
    <div className="stat-card">
      <div className="stat-card-icon">{icon}</div>
      <div className="stat-card-label">{label}</div>
      <div className="stat-card-value">{value}</div>
      <div className="stat-card-sub">{sub}</div>
    </div>
  );
}

export function Donut({ title, data, total }) {
  const stops = data.map((d, i) => {
    const from = data.slice(0, i).reduce((sum, x) => sum + x.pct, 0);
    const to = from + d.pct;
    return `${d.color} ${from}% ${to}%`;
  });
  const gradient = stops.length ? `conic-gradient(${stops.join(", ")})` : "conic-gradient(#e5e7eb 0% 100%)";

  return (
    <div className="chart-card">
      <h3 className="chart-title">{title}</h3>
      <div className="donut-row">
        <div className="donut-wrap">
          <div className="donut" style={{ background: gradient }}>
            <div className="donut-hole">
              <div className="donut-total">{formatNumber(total)}</div>
              <div className="donut-total-label">TOTAL</div>
            </div>
          </div>
        </div>
        <div className="donut-legend">
          {data.length === 0 && <p className="mgmt-empty">No data yet.</p>}
          {data.map(d => (
            <div className="donut-legend-item" key={d.label}>
              <span className="donut-legend-dot" style={{ background: d.color }} />
              <span className="donut-legend-label">{d.label}</span>
              <span className="donut-legend-value">{formatNumber(d.value)} · {d.pct}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function TrendChart({ data }) {
  const max = Math.max(1, ...data.map(d => Math.max(d.handled, d.abandoned)));
  return (
    <div className="chart-card">
      <h3 className="chart-title">Handled vs Abandoned by Period</h3>
      {data.length === 0 ? (
        <p className="mgmt-empty">No historical data yet.</p>
      ) : (
        <>
          <div className="trend-chart">
            <div className="trend-axis-max">{formatNumber(max)}</div>
            <div className="trend-bars">
              {data.map(d => (
                <div className="trend-bar-group" key={d.period}>
                  <div className="trend-bar-pair">
                    <div className="trend-bar handled" style={{ height: `${(d.handled / max) * 100}%` }} title={`Handled: ${d.handled}`} />
                    <div className="trend-bar abandoned" style={{ height: `${(d.abandoned / max) * 100}%` }} title={`Abandoned: ${d.abandoned}`} />
                  </div>
                  <div className="trend-bar-label">{d.period}</div>
                </div>
              ))}
            </div>
            <div className="trend-axis-zero">0</div>
          </div>
          <div className="trend-legend">
            <span><span className="trend-dot handled" /> Handled</span>
            <span><span className="trend-dot abandoned" /> Abandoned</span>
          </div>
        </>
      )}
    </div>
  );
}

export function GroupRow({ group }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="group-row-wrap">
      <div className="group-row" onClick={() => setOpen(o => !o)}>
        <span className={"group-chevron" + (open ? " open" : "")}><IconChevron /></span>
        <span className="group-name">{group.group}</span>
        <span className="group-summary">
          {formatNumber(group.offered)} offered · {group.answerRate}% answered
        </span>
        <span className={"status-badge " + group.status}>{STATUS_LABEL[group.status]}</span>
      </div>
      {open && (
        <div className="desk-table-scroll">
          <table className="desk-table">
            <thead>
              <tr>
                <th>Desk</th><th>Offered</th><th>Handled</th><th>Abandoned</th>
                <th>Answer Rate</th><th>Abandon Rate</th><th>Target</th><th>Status</th>
                <th>ASA</th><th>AHT</th><th>Avg Hold</th>
              </tr>
            </thead>
            <tbody>
              {group.desks.map(d => (
                <tr key={d.queue}>
                  <td className="desk-name-cell">{d.queue}</td>
                  <td>{formatNumber(d.offered)}</td>
                  <td>{formatNumber(d.handled)}</td>
                  <td>{formatNumber(d.abandoned)}</td>
                  <td>{d.answerRate}%</td>
                  <td>{d.abandonRate}%</td>
                  <td>{d.target}%</td>
                  <td><span className={"status-badge " + d.status}>{STATUS_LABEL[d.status]}</span></td>
                  <td>{formatDuration(d.asaSeconds)}</td>
                  <td>{formatDuration(d.ahtSeconds)}</td>
                  <td>{formatDuration(d.holdSeconds)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

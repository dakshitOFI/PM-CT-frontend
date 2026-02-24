"use client"
import { useEffect, useState } from "react"
import {
  PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid
} from "recharts"

/* ── SVG Icons ──────────────────────────────────────────────── */
const icons = {
  dashboard: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
    </svg>
  ),
  machines: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
      <line x1="12" y1="12" x2="12" y2="16" /><line x1="10" y1="14" x2="14" y2="14" />
    </svg>
  ),
  failures: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  analytics: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" /><line x1="2" y1="20" x2="22" y2="20" />
    </svg>
  ),
  agent: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4" /><path d="M6 20v-1a6 6 0 0 1 12 0v1" />
      <circle cx="19" cy="9" r="2" /><path d="M19 11v6" />
    </svg>
  ),
  search: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  ),
  shield: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
  chevronDown: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  ),
}

/* ── KPI icon + color config ────────────────────────────────── */
const kpiConfig: Record<string, { icon: string; iconBg: string; iconColor: string }> = {
  Machines: { icon: "⚙️", iconBg: "rgba(59,142,232,0.1)", iconColor: "#1a6bc8" },
  Incidents: { icon: "⚠️", iconBg: "rgba(249,115,22,0.1)", iconColor: "#f97316" },
  MTBF: { icon: "⏱️", iconBg: "rgba(16,185,129,0.1)", iconColor: "#10b981" },
  MTTR: { icon: "🔧", iconBg: "rgba(168,85,247,0.1)", iconColor: "#a855f7" },
  Availability: { icon: "📶", iconBg: "rgba(20,184,166,0.1)", iconColor: "#14b8a6" },
  Downtime: { icon: "🕑", iconBg: "rgba(239,68,68,0.1)", iconColor: "#ef4444" },
  "Earnings Impact": { icon: "💶", iconBg: "rgba(245,158,11,0.12)", iconColor: "#f59e0b" },
}

/* ── Recharts custom tooltip ────────────────────────────────── */
function CustomTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: "white",
        border: "1px solid #e2e8f0",
        borderRadius: 10,
        padding: "10px 14px",
        boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
        fontSize: 13,
        fontWeight: 500,
        color: "#1e293b",
      }}>
        <div style={{ color: "#94a3b8", fontSize: 11, marginBottom: 4 }}>{label}</div>
        <div style={{ color: "#1354a5", fontWeight: 700 }}>{payload[0].value}</div>
      </div>
    )
  }
  return null
}

/* ══════════════════════════════════════════════════════════════
   MAIN DASHBOARD COMPONENT
   ══════════════════════════════════════════════════════════════ */
export default function Dashboard() {
  const [warrantyData, setWarrantyData] = useState<any[]>([])
  const [showWarranty, setShowWarranty] = useState(false)
  const [warrantyLoading, setWarrantyLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [showAll, setShowAll] = useState(false)
  const [kpis, setKpis] = useState<any>(null)
  const [filter, setFilter] = useState("all")
  const [visuals, setVisuals] = useState<any>(null)
  const [activeNav, setActiveNav] = useState("Dashboard")
  const [currentTime, setCurrentTime] = useState("")

  /* Live clock */
  useEffect(() => {
    const tick = () => {
      const now = new Date()
      setCurrentTime(now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" }) +
        "  |  " + now.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }))
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  /* Data fetch */
  useEffect(() => {
    fetch("/api/dashboard/overview").then(r => r.json()).then(setKpis)
    fetch("/api/dashboard/visuals").then(r => r.json()).then(setVisuals)
  }, [])

  /* Loading screen */
  if (!kpis) return (
    <div className="loading-screen">
      {/* Uniper Logo Mark */}
      <div className="loading-logo">
        <UniperLogoMark size={64} />
      </div>
      <div className="loading-bar">
        <div className="loading-bar-fill" />
      </div>
      <div className="loading-text">Loading PMCT Dashboard…</div>
    </div>
  )

  const navItems = [
    { label: "Dashboard", icon: icons.dashboard },
    { label: "Machines", icon: icons.machines },
    { label: "Failures", icon: icons.failures },
    { label: "Analytics", icon: icons.analytics },
    { label: "Agent 1", icon: icons.agent },
  ]

  return (
    <div className="dashboard-container">

      {/* ── SIDEBAR ──────────────────────────────────────────── */}
      <aside className="sidebar">

        {/* Brand */}
        <div className="sidebar-brand">
          <div className="sidebar-logo">
            <UniperLogoMark size={36} />
          </div>
          <div className="sidebar-brand-text">
            <div className="sidebar-brand-name">Uniper</div>
            <div className="sidebar-brand-sub">PMCT Control Tower</div>
          </div>
        </div>

        {/* Nav */}
        <div className="sidebar-section-label">Navigation</div>
        <nav>
          {navItems.map(item => (
            <div
              key={item.label}
              className={`nav-item ${activeNav === item.label ? "active" : ""}`}
              onClick={() => setActiveNav(item.label)}
              id={`nav-${item.label.toLowerCase().replace(" ", "-")}`}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="user-avatar">UN</div>
            <div className="user-info">
              <div className="user-name">Uniper User</div>
              <div className="user-role">Plant Engineer</div>
            </div>
          </div>
        </div>
      </aside>

      {/* ── MAIN ─────────────────────────────────────────────── */}
      <main className="main">

        {/* Topbar */}
        <div className="topbar">
          <div className="topbar-left">
            <div className="header-title">Overview</div>
            <div className="header-sub">Real-time performance intelligence</div>
          </div>
          <div className="topbar-right">
            <div className="topbar-badge">
              <span className="dot" />
              Live
            </div>
            <div className="topbar-time">{currentTime}</div>
          </div>
        </div>

        {/* Page content */}
        <div className="page-content">

          {/* ── KPI SECTION ───────────────────────────────────── */}
          <div className="section-header">
            <div className="section-title">Key Performance Indicators</div>
          </div>

          <div className="kpi-grid">
            <KpiCard title="Machines" value={kpis.machines} />
            <KpiCard title="Incidents" value={kpis.incidents} />
            <KpiCard title="MTBF" value={`${kpis.mtbf}h`} />
            <KpiCard title="MTTR" value={`${kpis.mttr}h`} />
            <KpiCard title="Availability" value={`${kpis.availability}%`} highlight />
            <KpiCard title="Downtime" value={`${kpis.totalDowntime}h`} />
            <KpiCard
              title="Earnings Impact"
              value={`€${(kpis.earningsImpact / 1_000_000).toFixed(2)}M`}
              highlight
            />
          </div>

          {/* ── CHARTS ────────────────────────────────────────── */}
          {visuals && (
            <>
              <div className="section-header">
                <div className="section-title">Visual Analytics</div>
              </div>

              <div className="visual-grid">

                {/* Warranty Pie */}
                <div className="chart-card" id="chart-warranty">
                  <h3>Warranty Status</h3>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <PieChart width={280} height={220}>
                      <Pie
                        data={visuals.warrantyDistribution}
                        dataKey="value"
                        nameKey="name"
                        outerRadius={85}
                        innerRadius={42}
                        paddingAngle={3}
                      >
                        {visuals.warrantyDistribution.map((entry: any, index: number) => (
                          <Cell
                            key={index}
                            fill={
                              entry.name === "In Warranty" ? "#1a6bc8"
                                : entry.name === "Expired" ? "#ef4444"
                                  : "#f97316"
                            }
                          />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>

                    {/* Legend */}
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", justifyContent: "center", marginTop: 12 }}>
                      {visuals.warrantyDistribution.map((item: any, i: number) => {
                        const color = item.name === "In Warranty" ? "#1a6bc8"
                          : item.name === "Expired" ? "#ef4444"
                            : "#f97316"
                        return (
                          <div key={i} style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 13, fontWeight: 500 }}>
                            <div style={{ width: 10, height: 10, borderRadius: "50%", background: color, flexShrink: 0 }} />
                            <span style={{ color: "#475569" }}>{item.name}</span>
                            <span style={{ color: "#94a3b8", fontWeight: 400 }}>({item.value})</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>

                {/* Top Failure Machines — horizontal scrollable ranked list */}
                <div className="chart-card" id="chart-failures">
                  <h3>Top Failure Machines</h3>
                  <FailureRankList data={visuals.topFailures} />
                </div>

                {/* Monthly Trend Line — full width */}
                <div className="chart-card full-width" id="chart-monthly-trend">
                  <h3>Monthly Failure Trend</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={visuals.monthlyTrend} margin={{ top: 4, right: 16, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis
                        dataKey="month"
                        tick={{ fontSize: 12, fill: "#94a3b8", fontWeight: 500 }}
                        axisLine={false} tickLine={false}
                      />
                      <YAxis
                        tick={{ fontSize: 12, fill: "#94a3b8" }}
                        axisLine={false} tickLine={false}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <defs>
                        <linearGradient id="lineAreaGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#1a6bc8" stopOpacity={0.15} />
                          <stop offset="95%" stopColor="#1a6bc8" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <Line
                        type="monotone"
                        dataKey="count"
                        stroke="#1a6bc8"
                        strokeWidth={2.5}
                        dot={{ fill: "#1a6bc8", r: 4, strokeWidth: 0 }}
                        activeDot={{ r: 6, fill: "#3b8ee8", strokeWidth: 0 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

              </div>
            </>
          )}

          {/* ── WARRANTY SECTION ──────────────────────────────── */}
          <div className="divider" />

          <div className="section-header">
            <div className="section-title">Machine Warranty</div>
          </div>

          <button
            id="btn-check-warranty"
            className={`warranty-trigger-btn ${warrantyLoading ? "loading" : ""}`}
            disabled={warrantyLoading}
            onClick={async () => {
              setWarrantyLoading(true)
              setShowWarranty(true)
              setWarrantyData([])
              const res = await fetch("/api/machines/warranty")
              const data = await res.json()
              // small delay so skeleton shimmer plays for at least 600ms
              await new Promise(r => setTimeout(r, 600))
              setWarrantyData(data)
              setWarrantyLoading(false)
            }}
          >
            {warrantyLoading ? <span className="btn-spinner" /> : icons.shield}
            {warrantyLoading ? "Fetching Warranty Data…" : "Check Machine Warranty"}
          </button>

          {showWarranty && (
            <div className="warranty-section">
              <div className="warranty-header">
                <div className="warranty-header-title">
                  {icons.shield}
                  Warranty Overview
                </div>
                {!warrantyLoading && (
                  <span style={{ fontSize: 13, color: "#94a3b8", fontWeight: 500 }}>
                    {warrantyData.length} machines total
                  </span>
                )}
              </div>

              {warrantyLoading ? (
                /* ── SKELETON LOADING STATE ── */
                <div className="warranty-skeleton-wrap">
                  <div className="skeleton-status-bar">
                    <span className="skeleton-pulse-dot" />
                    <span className="skeleton-status-text">Fetching machine warranty data…</span>
                  </div>
                  <div className="warranty-grid">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className="warranty-card skeleton-card" style={{ animationDelay: `${i * 80}ms` }}>
                        <div className="skeleton-line" style={{ width: "45%", height: 11, marginBottom: 8 }} />
                        <div className="skeleton-line" style={{ width: "70%", height: 16, marginBottom: 16 }} />
                        <div className="skeleton-line" style={{ width: "55%", height: 11, marginBottom: 6 }} />
                        <div className="skeleton-line" style={{ width: "40%", height: 11, marginBottom: 14 }} />
                        <div className="skeleton-line" style={{ width: "30%", height: 22, borderRadius: 999 }} />
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                /* ── REAL DATA ── */
                <div className="warranty-data-appear">
                  {/* Controls */}
                  <div className="warranty-controls">
                    <div className="search-wrapper">
                      <span className="search-icon">{icons.search}</span>
                      <input
                        id="warranty-search"
                        type="text"
                        placeholder="Search by Machine ID…"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="search-input"
                      />
                    </div>

                    <select
                      id="warranty-filter"
                      value={filter}
                      onChange={e => setFilter(e.target.value)}
                      className="filter-select"
                    >
                      <option value="all">All Status</option>
                      <option value="active">In Warranty</option>
                      <option value="expired">Expired</option>
                    </select>
                  </div>

                  {/* Machine grid */}
                  <div className="warranty-grid">
                    {(showAll ? warrantyData : warrantyData.slice(0, 6))
                      .filter(m => m.machine_id.toString().includes(searchTerm))
                      .filter(m =>
                        filter === "all" ? true
                          : filter === "active" ? m.status === "In Warranty"
                            : m.status === "Expired"
                      )
                      .map((machine, idx) => {
                        const expired = machine.status === "Expired"
                        return (
                          <div
                            key={machine.machine_id}
                            className="warranty-card warranty-card-enter"
                            style={{ animationDelay: `${idx * 60}ms` }}
                          >
                            <div className="machine-card-top">
                              <div>
                                <div className="machine-id">ID: {machine.machine_id}</div>
                                <div className="machine-name">{machine.machine_name}</div>
                              </div>
                              <span className={`status-badge ${expired ? "status-expired" : "status-active"}`}>
                                {machine.status}
                              </span>
                            </div>
                            <div className="machine-meta">
                              <span className="machine-meta-label">Expiry:</span>
                              {machine.expiry_date.split("T")[0]}
                            </div>
                            <div className="machine-meta">
                              <span className="machine-meta-label">Remaining:</span>
                              <span style={{ color: expired ? "#ef4444" : "#10b981", fontWeight: 600 }}>
                                {machine.remaining_days} days
                              </span>
                            </div>
                          </div>
                        )
                      })
                    }
                  </div>

                  {!showAll && warrantyData.length > 6 && (
                    <button
                      id="btn-show-more-warranty"
                      className="show-more-btn"
                      onClick={() => setShowAll(true)}
                    >
                      {icons.chevronDown}
                      Show all {warrantyData.length} machines
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

        </div>{/* end page-content */}
      </main>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════
   SUB-COMPONENTS
   ══════════════════════════════════════════════════════════════ */

function KpiCard({ title, value, highlight }: { title: string; value: any; highlight?: boolean }) {
  const cfg = kpiConfig[title] ?? { icon: "📊", iconBg: "rgba(59,142,232,0.1)", iconColor: "#1a6bc8" }
  return (
    <div className="kpi-card" id={`kpi-${title.toLowerCase().replace(/\s+/g, "-")}`}>
      <div className="kpi-icon" style={{ background: cfg.iconBg, fontSize: 20 }}>
        {cfg.icon}
      </div>
      <div className="kpi-title">{title}</div>
      <div className={`kpi-value ${highlight ? "highlight" : ""}`}>{value}</div>
    </div>
  )
}

/* ── Failure Rank List ──────────────────────────────────────── */
function FailureRankList({ data }: { data: { machine_id: string; count: number }[] }) {
  if (!data || data.length === 0) {
    return (
      <div style={{ color: "#94a3b8", fontSize: 13, padding: "16px 0" }}>
        No failure data available.
      </div>
    )
  }

  const maxCount = Math.max(...data.map(d => Number(d.count)))

  // Rank colors for the top 3
  const rankColors: Record<number, string> = {
    0: "#f59e0b",  // gold
    1: "#94a3b8",  // silver
    2: "#b45309",  // bronze
  }

  return (
    <div
      style={{
        maxHeight: 340,
        overflowY: "auto",
        paddingRight: 4,
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}
    >
      {data.map((item, index) => {
        const count = Number(item.count)
        const pct = maxCount > 0 ? (count / maxCount) * 100 : 0
        const isTop = index < 3

        return (
          <div key={item.machine_id} style={{ display: "flex", alignItems: "center", gap: 10 }}>

            {/* Rank badge */}
            <div
              style={{
                width: 26,
                height: 26,
                borderRadius: "50%",
                background: isTop ? rankColors[index] : "#f1f5f9",
                color: isTop ? "#fff" : "#94a3b8",
                fontWeight: 700,
                fontSize: 11,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              {index + 1}
            </div>

            {/* Machine ID label */}
            <div
              style={{
                width: 90,
                fontSize: 12,
                fontWeight: 600,
                color: "#1e293b",
                flexShrink: 0,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
              title={`Machine ${item.machine_id}`}
            >
              ID: {item.machine_id}
            </div>

            {/* Progress bar track */}
            <div
              style={{
                flex: 1,
                height: 10,
                background: "#f1f5f9",
                borderRadius: 999,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${pct}%`,
                  height: "100%",
                  borderRadius: 999,
                  background: isTop
                    ? `linear-gradient(90deg, #1354a5, #3b8ee8)`
                    : `linear-gradient(90deg, #475569, #94a3b8)`,
                  transition: "width 0.6s cubic-bezier(0.4,0,0.2,1)",
                }}
              />
            </div>

            {/* Count badge */}
            <div
              style={{
                minWidth: 32,
                textAlign: "right",
                fontSize: 12,
                fontWeight: 700,
                color: isTop ? "#1354a5" : "#475569",
                flexShrink: 0,
              }}
            >
              {count}
            </div>

          </div>
        )
      })}
    </div>
  )
}

/* ── Uniper SVG Logo Mark ───────────────────────────────────── */
function UniperLogoMark({ size = 36 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Flame / energy mark */}
      <circle cx="24" cy="24" r="24" fill="#0a2d5e" />
      <path
        d="M24 8C24 8 16 18 16 25C16 29.4183 19.5817 33 24 33C28.4183 33 32 29.4183 32 25C32 18 24 8 24 8Z"
        fill="url(#flameGrad)"
      />
      <path
        d="M24 22C24 22 20 26.5 20 28.5C20 30.433 21.8 32 24 32C26.2 32 28 30.433 28 28.5C28 26.5 24 22 24 22Z"
        fill="white"
        opacity="0.9"
      />
      <defs>
        <linearGradient id="flameGrad" x1="24" y1="8" x2="24" y2="33" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#1a6bc8" />
        </linearGradient>
      </defs>
    </svg>
  )
}

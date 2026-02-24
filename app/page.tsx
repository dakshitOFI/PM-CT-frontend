"use client"
import { useEffect, useState } from "react"
import {
  PieChart, Pie, Cell,
  BarChart, Bar, XAxis, YAxis, Tooltip,
  LineChart, Line, CartesianGrid
} from "recharts"

export default function Dashboard() {
  const [warrantyData, setWarrantyData] = useState<any[]>([])
  const [showWarranty, setShowWarranty] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [showAll, setShowAll] = useState(false)
  const [kpis, setKpis] = useState<any>(null)
  const [filter, setFilter] = useState("all")
  const [visuals, setVisuals] = useState<any>(null)

  useEffect(() => {
    fetch("/api/dashboard/overview")
      .then(res => res.json())
      .then(data => setKpis(data))
    fetch("/api/dashboard/visuals")
      .then(res => res.json())
      .then(data => setVisuals(data))
  }, [])


  if (!kpis) return <div>Loading...</div>

  return (
    <div className="dashboard-container">

      {/* Sidebar */}
      <aside className="sidebar">
        <h2>Control Tower</h2>
        <nav>
          <div>Dashboard</div>
          <div>Machines</div>
          <div>Failures</div>
          <div>Analytics</div>
          <div>Agent 1</div>
        </nav>
      </aside>

      {/* Main */}
      <main className="main">

        <div className="header-title">Overview</div>
        <div className="header-sub">
          Real-time performance intelligence
        </div>

        <div className="kpi-grid">

          <Kpi title="Machines" value={kpis.machines} />
          <Kpi title="Incidents" value={kpis.incidents} />
          <Kpi title="MTBF" value={`${kpis.mtbf}h`} />
          <Kpi title="MTTR" value={`${kpis.mttr}h`} />
          <Kpi title="Availability" value={`${kpis.availability}%`} />
          <Kpi title="Downtime" value={`${kpis.totalDowntime}h`} />
          <Kpi
            title="Earnings Impact"
            value={`€${(kpis.earningsImpact / 1000000).toFixed(2)}M`}
          />
        </div>

        {visuals && (
          <div className="visual-grid">

            {/* Warranty Pie */}
            {/* <div className="chart-card">
              <h3>Warranty Status</h3>
              <PieChart width={300} height={250}>
                <Pie
                  data={visuals.warrantyDistribution}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={90}
                  label
                >
                  {visuals.warrantyDistribution.map((entry: any, index: number) => (
                    <Cell
                      key={index}
                      fill={
                        entry.name === "In Warranty"
                          ? "#16a34a"
                          : entry.name === "Expired"
                            ? "#7f1d1d"
                            : "#dc2626"
                      }
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </div> */}
            {/* Warranty Pie */}
<div className="chart-card">
  <h3>Warranty Status</h3>

  <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>

    <PieChart width={300} height={250}>
      <Pie
        data={visuals.warrantyDistribution}
        dataKey="value"
        nameKey="name"
        outerRadius={90}
      >
        {visuals.warrantyDistribution.map((entry: any, index: number) => (
          <Cell
            key={index}
            fill={
              entry.name === "In Warranty"
                ? "#16a34a"
                : entry.name === "Expired"
                ? "#7f1d1d"
                : "#dc2626"
            }
          />
        ))}
      </Pie>
      <Tooltip />
    </PieChart>

    {/* Legend */}
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        gap: "30px",
        marginTop: "15px",
        flexWrap: "wrap"
      }}
    >
      {visuals.warrantyDistribution.map((item: any, index: number) => {

        const color =
          item.name === "In Warranty"
            ? "#16a34a"
            : item.name === "Expired"
            ? "#7f1d1d"
            : "#dc2626"

        return (
          <div
            key={index}
            style={{
              display: "flex",
              alignItems: "center",
              fontSize: "14px"
            }}
          >
            <div
              style={{
                width: "14px",
                height: "14px",
                borderRadius: "3px",
                backgroundColor: color,
                marginRight: "8px"
              }}
            />
            <span style={{ fontWeight: 500 }}>
              {item.name}
            </span>
            <span style={{ marginLeft: "6px", color: "#64748b" }}>
              ({item.value})
            </span>
          </div>
        )
      })}
    </div>

  </div>
</div>

            

            



            {/* Top Failures */}
            <div className="chart-card">
              <h3>Top 5 Failure Machines</h3>
              <BarChart width={350} height={250} data={visuals.topFailures}>
                <XAxis dataKey="machine_id" />   {/* ✅ FIXED */}
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#2563eb" />   {/* ✅ FIXED */}
              </BarChart>
            </div>

            {/* Monthly Trend */}
            <div className="chart-card full-width">
              <h3>Monthly Failure Trend</h3>
              <LineChart width={700} height={250} data={visuals.monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#2563eb" /> {/* ✅ FIXED */}
              </LineChart>
            </div>

          </div>
        )
        }









        <button
          style={{
            marginBottom: "40px",
            padding: "12px 24px",
            background: "#0f172a",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer"
          }}

          onClick={async () => {
            console.log("Button clicked")

            const res = await fetch("/api/machines/warranty")
            const data = await res.json()

            console.log(data)

            setWarrantyData(data)
            setShowWarranty(true)
          }}

        >
          Check Machine Warranty
        </button>

        {showWarranty && (
          <div className="warranty-section">

            {/* SEARCH + FILTER ROW */}
            <div className="warranty-controls">
              <input
                type="text"
                placeholder="Search by Machine ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />

              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="filter-select"
              >
                <option value="all">All</option>
                <option value="active">In Warranty</option>
                <option value="expired">Expired</option>
              </select>
            </div>

            {/* MACHINE GRID */}
            <div className="warranty-grid">
              {(showAll ? warrantyData : warrantyData.slice(0, 5))
                .filter(machine =>
                  machine.machine_id.toString().includes(searchTerm)
                )
                .filter(machine =>
                  filter === "all"
                    ? true
                    : filter === "active"
                      ? machine.status === "In Warranty"
                      : machine.status === "Expired"
                )
                .map(machine => {

                  let statusClass = "status-active"

                  if (machine.status === "Expired") {
                    statusClass = "status-expired"
                  }

                  return (
                    <div key={machine.machine_id} className="warranty-card">

                      <div className="machine-id">
                        ID: {machine.machine_id}
                      </div>

                      <div className="machine-name">
                        {machine.machine_name}
                      </div>

                      <div className="machine-meta">
                        Expiry: {machine.expiry_date.split("T")[0]}
                      </div>

                      <div className="machine-meta">
                        Remaining: {machine.remaining_days} days
                      </div>

                      <div className={`status-badge ${statusClass}`}>
                        {machine.status}
                      </div>

                    </div>
                  )
                })}
            </div>

            {!showAll && warrantyData.length > 5 && (
              <button
                className="show-more-btn"
                onClick={() => setShowAll(true)}
              >
                Show More
              </button>
            )}

          </div>
        )}





      </main>

    </div>
  )
}

function Kpi({ title, value }: any) {
  return (
    <div className="kpi-card">
      <div className="kpi-title">{title}</div>
      <div className="kpi-value">{value}</div>
    </div>
  )
}

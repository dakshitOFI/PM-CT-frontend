"use client"
import { supabase } from "@/lib/supabase"
import { useEffect, useState } from "react"
import {
  PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid, BarChart, Bar
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
  logout: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  ),
  bolt: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  ),
  package: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16.5 9.4l-9-5.19" /><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  ),
  technical: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2" ry="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" />
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
  "Lead Time Impact": { icon: "�", iconBg: "rgba(99,102,241,0.1)", iconColor: "#6366f1" },
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
  const [activeNav, setActiveNav] = useState("Dashboard") // will be synced in useEffect
  const [notification, setNotification] = useState<string | null>(null)
  const [actionsNeeded, setActionsNeeded] = useState<any[]>([])
  const [selectedQRCode, setSelectedQRCode] = useState<any>(null)

  /* Persist navigation choice */
  useEffect(() => {
    const saved = localStorage.getItem("pmct_active_nav")
    if (saved) setActiveNav(saved)
  }, [])

  useEffect(() => {
    localStorage.setItem("pmct_active_nav", activeNav)
  }, [activeNav])
  const [currentTime, setCurrentTime] = useState("")
  const [anomalies, setAnomalies] = useState<any[]>([])
  // Agent 2 States
  const [healthyMachines, setHealthyMachines] = useState<any[]>([])
  const [maintenanceData, setMaintenanceData] = useState<any[]>([])
  const [rfpData, setRfpData] = useState<any[]>([])
  const [poData, setPoData] = useState<any[]>([])
  const [depreciationStats, setDepreciationStats] = useState<any>(null)
  const [depreciationBuckets, setDepreciationBuckets] = useState<any[]>([])
  const [agentLoading, setAgentLoading] = useState(false)
  const [agentSearch, setAgentSearch] = useState("")
  const [rfpSearch, setRfpSearch] = useState("")
  const [maintenanceSearch, setMaintenanceSearch] = useState("")
  const [healthySearch, setHealthySearch] = useState("")
  const [agentFilter, setAgentFilter] = useState("all")   // "all" | "confirmed" | "pending"
  const [agentPage, setAgentPage] = useState(0)           // sliding window page index
  const [warrantyPage, setWarrantyPage] = useState(0)

  // Agent 3 States
  const [lowStockData, setLowStockData] = useState<any[]>([])
  const [warrantyClaimData, setWarrantyClaimData] = useState<any[]>([])
  const [reorderSoonData, setReorderSoonData] = useState<any[]>([])
  const [sufficientStockData, setSufficientStockData] = useState<any[]>([])

  // Technician View States
  const [techMachines, setTechMachines] = useState<any[]>([])
  const [techFailures, setTechFailures] = useState<any[]>([])
  const [techSearch, setTechSearch] = useState("")
  const [techTab, setTechTab] = useState<"machines" | "failures" | "inventory">("machines")
  const [techLoading, setTechLoading] = useState(false)

  // Derived Mailto Link for QR Code (Single Machine)
  const subject = selectedQRCode ? `Please check the machine with ID: ${selectedQRCode.id}` : ""
  const body = selectedQRCode ? `
Hello,

Here are the details for machine ${selectedQRCode.id}:

• Status: ${selectedQRCode.status}
• Detected Issue: ${selectedQRCode.issue}
• Summary: ${selectedQRCode.summary}
• Recommendation: ${selectedQRCode.recommendation}

Please investigate as soon as possible.

Sent from PMCT Control Tower
  `.trim() : ""

  const mailtoLink = selectedQRCode ? `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}` : ""

  // Derived Mailto Link for All Anomalies Summary
  const summarySubject = `Plant Machine Health Summary - ${new Date().toLocaleDateString()}`
  const summaryBody = anomalies.length > 0 ? `
Full Machine Status Summary Report
Generated: ${new Date().toLocaleString()}

${anomalies.map(item => {
    const statusSeed = (item.report_id || 0) % 3;
    const statusLabel = ["Operational", "Malfunctioning", "Down"][statusSeed];
    return `• Machine ID: ${item.machine_id}
  Status: ${statusLabel}
  Issue: ${item.root_cause_prediction || "ML Predicted Fault"}
  Summary: ${item.issue_summary || "—"}
  Recommendation: ${item.buyer_recommendation || "Needs Review"}
  -----------------------------------`;
  }).join("\n\n")}

Sent from PMCT Control Tower
  `.trim() : "No active anomalies to report."

  const allAnomaliesMailto = `mailto:?subject=${encodeURIComponent(summarySubject)}&body=${encodeURIComponent(summaryBody)}`

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
    // Fetch warranty data in background so it's ready for Actions Needed table
    fetch("/api/machines/warranty").then(r => r.json()).then(setWarrantyData)
  }, [])

  const handleWarrantyFetch = async (delayMs = 600) => {
    setWarrantyLoading(true)
    setShowWarranty(true)
    setWarrantyData([])
    const res = await fetch("/api/machines/warranty")
    const data = await res.json()
    await new Promise(r => setTimeout(r, delayMs))
    setWarrantyData(data)
    setWarrantyLoading(false)
  }

  useEffect(() => {
    if (activeNav === "Check Warranty" && !warrantyData.length && !warrantyLoading) {
      handleWarrantyFetch(5000) // 5 second delay for sidebar navigation as requested
    }
  }, [activeNav])

  const fetchAnomalies = async () => {
    const { data, error } = await supabase
      .from("anomaly_reports")
      .select("*")
      .order("created_at", { ascending: false })

    if (!error && data) {
      setAnomalies(data)
    }
  }

  const fetchAgent2Data = async () => {
    const { data: healthy } = await supabase
      .from("healthy_machines")
      .select("*")

    const { data: maintenance } = await supabase
      .from("maintenance_schedule")
      .select("*")

    const { data: rfp } = await supabase
      .from("rfp_generated")
      .select("*")

    const { data: po } = await supabase
      .from("po_generated")
      .select("*")

    setHealthyMachines(healthy || [])
    setMaintenanceData(maintenance || [])
    setRfpData(rfp || [])
    setPoData(po || [])

    const combined = [
      ...(healthy || []),
      ...(maintenance || []),
      ...(rfp || []),
      ...(po || [])
    ]

    if (combined.length > 0) {

      const totalAssets = combined.length

      const totalPurchaseValue = combined.reduce(
        (sum, m) => sum + (Number(m.purchase_cost) || 0),
        0
      )

      const totalDepPercent = combined.reduce(
        (sum, m) => sum + (Number(m.depreciation_percent) || 0),
        0
      )

      const avgDepPercent =
        totalAssets > 0 ? (totalDepPercent / totalAssets).toFixed(1) : 0

      const highDepCount = combined.filter(
        m => Number(m.depreciation_percent) >= 80
      ).length

      setDepreciationStats({
        totalAssets,
        totalPurchaseValue,
        avgDepPercent,
        highDepCount
      })

      // Buckets
      const buckets = [
        { name: "0-25%", value: 0 },
        { name: "25-50%", value: 0 },
        { name: "50-75%", value: 0 },
        { name: "75-100%", value: 0 },
      ]

      combined.forEach(m => {
        const dep = Number(m.depreciation_percent) || 0
        if (dep <= 25) buckets[0].value++
        else if (dep <= 50) buckets[1].value++
        else if (dep <= 75) buckets[2].value++
        else buckets[3].value++
      })

      setDepreciationBuckets(buckets)

    } else {

      setDepreciationStats({
        totalAssets: 0,
        totalPurchaseValue: 0,
        avgDepPercent: 0,
        highDepCount: 0
      })

      setDepreciationBuckets([
        { name: "0-25%", value: 0 },
        { name: "25-50%", value: 0 },
        { name: "50-75%", value: 0 },
        { name: "75-100%", value: 0 },
      ])
    }
  }

  const fetchAgent3Data = async () => {
    const { data: low } = await supabase.from("low_stock").select("*")
    const { data: warranty } = await supabase.from("warranty_claim").select("*")
    const { data: reorder } = await supabase.from("reorder_soon").select("*")
    const { data: sufficient } = await supabase.from("sufficient_stock").select("*")

    setLowStockData(low || [])
    setWarrantyClaimData(warranty || [])
    setReorderSoonData(reorder || [])
    setSufficientStockData(sufficient || [])
  }

  const downloadRfpFile = (item: any) => {
    const content = `
      <html>
        <head>
          <meta charset="utf-8">
        </head>
        <body>
          <h2>Request for Proposal (RFP)</h2>
          <p><strong>Machine ID:</strong> ${item.machine_id}</p>
          <p><strong>Machine Type:</strong> ${item.machine_type}</p>
          <p><strong>Remaining Life:</strong> ${item.predicted_remaining_life} years</p>
          <p><strong>Depreciation:</strong> ${item.depreciation_percent}%</p>
          <p><strong>Purchase Cost:</strong> $${item.purchase_cost}</p>
          <hr/>
          <h3>RFP Context</h3>
          <p>${item.rfp_content}</p>
        </body>
      </html>
    `

    const blob = new Blob([content], {
      type: "application/msword"
    })

    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = item.rfp_filename || "rfp_document.doc"
    link.click()
  }

  const downloadPoFile = (item: any) => {
    const content = `
      <html>
        <head>
          <meta charset="utf-8">
        </head>
        <body>
          <h2>Purchase Order (PO)</h2>
          <p><strong>Machine ID:</strong> ${item.machine_id}</p>
          <p><strong>Machine Type:</strong> ${item.machine_type}</p>
          <p><strong>Remaining Life:</strong> ${item.predicted_remaining_life} years</p>
          <p><strong>Depreciation:</strong> ${item.depreciation_percent}%</p>
          <p><strong>Purchase Cost:</strong> $${item.purchase_cost}</p>
          <hr/>
          <h3>PO Context</h3>
          <p>${item.po_content}</p>
        </body>
      </html>
    `

    const blob = new Blob([content], {
      type: "application/msword"
    })

    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = item.po_filename || "po_document.doc"
    link.click()
  }

  const sendRfpEmail = (item: any) => {
    const emailSubject = `[URGENT] RFP: Procurement Required for Machine ${item.machine_id}`
    const emailBody = `
Hello Procurement Team,

This is the Request for Proposal (RFP) documentation for machine ${item.machine_id}.

Machine Details:
----------------
- Machine ID: ${item.machine_id}
- Machine Type: ${item.machine_type}
- Remaining Life: ${item.predicted_remaining_life} years
- Depreciation: ${item.depreciation_percent}%
- Purchase Cost: $${item.purchase_cost?.toLocaleString()}
- Priority: ${item.priority}

RFP Narrative:
--------------
${item.rfp_content}

Note: For the full formal document, please download the .doc file from the PMCT Dashboard.

Regards,
PMCT Lifecycle Intelligence Tower
    `.trim()

    window.location.href = `mailto:?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`
  }

  const sendPoEmail = (item: any) => {
    const emailSubject = `[PO ISSUED] Machine ${item.machine_id}`
    const emailBody = `
Hello Procurement Team,

This is the Purchase Order documentation for machine ${item.machine_id}.

Machine Details:
----------------
- Machine ID: ${item.machine_id}
- Machine Type: ${item.machine_type}
- Remaining Life: ${item.predicted_remaining_life} years
- Depreciation: ${item.depreciation_percent}%
- Purchase Cost: $${item.purchase_cost?.toLocaleString()}
- Priority: ${item.priority}

PO Narrative:
-------------
${item.po_content}

This PO has been auto-generated by the PMCT Lifecycle Intelligence Agent.

Regards,
PMCT Control Tower
    `.trim()

    window.location.href = `mailto:?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`
  }

  const runAgent = async () => {
    try {
      setAgentLoading(true);

      // Trigger the background agent via webhook (no need to wait if we're reloading anyway)
      fetch("https://n8n.sofiatechnology.ai/webhook/run-agent-1", {
        method: "POST",
      }).catch(err => console.error("Webhook trigger error:", err));

      // Enforce the 20-second loading animation delay
      await new Promise(resolve => setTimeout(resolve, 20000));

      // Refresh the page automatically
      window.location.reload();
    } catch (error) {
      console.error("Agent failed:", error);
      setAgentLoading(false);
    }
  };

  const runAgent2 = async () => {
    try {
      setAgentLoading(true);

      // Trigger Agent 2 n8n workflow
      fetch("https://n8n.sofiatechnology.ai/webhook/agent2", {
        method: "POST",
      }).catch(err => console.error("Agent 2 webhook error:", err));

      // 20 second animation delay
      await new Promise(resolve => setTimeout(resolve, 20000));

      // Reload page
      window.location.reload();
    } catch (error) {
      console.error("Agent 2 failed:", error);
      setAgentLoading(false);
    }
  };

  const deleteAllAgent2 = async () => {
    if (!window.confirm("Delete ALL Agent 2 records? This cannot be undone.")) return;

    try {
      await supabase.from("healthy_machines").delete().neq("id", -1);
      await supabase.from("maintenance_schedule").delete().neq("schedule_id", -1);
      await supabase.from("rfp_generated").delete().neq("id", -1);
      await supabase.from("po_generated").delete().neq("id", -1);

      setHealthyMachines([]);
      setMaintenanceData([]);
      setRfpData([]);
      setPoData([]);

      setNotification("All Agent 2 records deleted successfully");
      setTimeout(() => setNotification(null), 3000);
    } catch (error) {
      console.error("Delete Agent 2 error:", error);
    }
  };
  // const confirmIssue = async (id: number) => {
  //   const { error } = await supabase
  //     .from("anomaly_reports")
  //     .update({ status: "confirmed" })
  //     .eq("report_id", id)

  //   if (!error) {
  //     setNotification("Issue confirmed and added to Actions Needed")
  //     setTimeout(() => setNotification(null), 3000)
  //   } else {
  //     console.error("Confirm error:", error)
  //   }

  //   fetchAnomalies()
  // }


  // const deleteIssue = async (id: number) => {
  //   await supabase
  //     .from("anomaly_reports")
  //     .delete()
  //     .eq("report_id", id)

  //   fetchAnomalies()
  // }

  const confirmIssue = (item: any) => {
    // Prevent duplicate
    const alreadyExists = actionsNeeded.some(a => a.report_id === item.report_id)
    if (alreadyExists) return

    setActionsNeeded(prev => [...prev, item])

    setNotification("Issue added to Actions Needed")
    setTimeout(() => setNotification(null), 3000)
  }

  const deleteIssue = async (id: number) => {
    console.log("Deleting ID:", id)

    const { error } = await supabase
      .from("anomaly_reports")
      .delete()
      .eq("report_id", id)

    if (!error) {
      setNotification("Issue dismissed successfully")
      setTimeout(() => setNotification(null), 3000)
    }

    fetchAnomalies()
  }

  const resolveIssue = async (id: number) => {
    const { error } = await supabase
      .from("anomaly_reports")
      .delete()
      .eq("report_id", id)

    if (!error) {
      setNotification("Issue resolved successfully")
      // Also clear from the local Actions Needed list if it exists there
      setActionsNeeded(prev => prev.filter(a => a.report_id !== id))
      setTimeout(() => setNotification(null), 3000)
    }

    fetchAnomalies()
  }

  const deleteAllIssues = async () => {
    if (!window.confirm("Delete ALL anomaly records from the database? This cannot be undone.")) return
    const { error } = await supabase
      .from("anomaly_reports")
      .delete()
      .neq("report_id", -1)   // matches every row
    console.log("Delete all error:", error)
    setAnomalies([])
    setAgentPage(0)
  }



  useEffect(() => {
    if (activeNav === "Machinery Performance") {
      fetchAnomalies()
    }

    if (activeNav === "Asset Maintenance") {
      fetchAgent2Data()
    }

    if (activeNav === "Spare-Parts Checker") {
      fetchAgent3Data()
    }

    if (activeNav === "Technician View") {
      fetchAnomalies()
      const fetchTechData = async () => {
        setTechLoading(true)
        try {
          // Fetch machines with full specs
          const { data: machines } = await supabase
            .from("machines")
            .select("*")
          setTechMachines(machines || [])

          // Fetch failure history
          const { data: failures } = await supabase
            .from("failure_history")
            .select("*")
            .order("failure_date", { ascending: false })
          setTechFailures(failures || [])

          // Also fetch agent data if not already loaded
          if (!lowStockData.length && !reorderSoonData.length) {
            fetchAgent3Data()
          }
          if (!healthyMachines.length && !maintenanceData.length && !rfpData.length) {
            fetchAgent2Data()
          }
        } catch (err) {
          console.error("Technician View fetch error:", err)
        }
        setTechLoading(false)
      }
      fetchTechData()
    }
  }, [activeNav])




  /* Loading screen */
  if (!kpis) return (
    <div className="loading-screen">
      <div className="loading-bar">
        <div className="loading-bar-fill" />
      </div>
      <div className="loading-text">Loading PMCT Dashboard…</div>
    </div>
  )

  const navItems = [
    { label: "Dashboard", icon: icons.dashboard },
    { label: "Check Warranty", icon: icons.shield },
    { label: "Technician View", icon: icons.technical },
    { label: "Machinery Performance", icon: icons.agent },
    { label: "Asset Maintenance", icon: icons.bolt },
    { label: "Spare-Parts Checker", icon: icons.package },
  ]

  return (
    <div className="dashboard-container">

      {/* ── SIDEBAR ──────────────────────────────────────────── */}
      <aside className="sidebar">

        {/* Brand */}
        <div className="sidebar-brand">
          <div className="sidebar-brand-text">
            <div className="sidebar-brand-name">PMCT</div>
            <div className="sidebar-brand-sub">Control Tower</div>
          </div>
        </div>

        {/* Nav */}
        <div className="sidebar-section-label">Navigation</div>
        <nav>
          {navItems.map(item => (
            <div
              key={item.label}
              className={`nav-item ${activeNav === item.label ? "active" : ""} ${item.label === "Technician View" ? "nav-technical" : ""}`}
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
          <div
            className="nav-item logout-nav-item"
            style={{ marginBottom: '12px', color: '#fca5a5' }}
            onClick={() => {
              if (window.confirm("Are you sure you want to logout?")) {
                alert("Logging out...");
                // Add your real logout logic here
              }
            }}
          >
            <span className="nav-icon">{icons.logout}</span>
            Logout
          </div>

          <div className="sidebar-user">
            <div className="user-avatar">AD</div>
            <div className="user-info">
              <div className="user-name">Admin User</div>
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

        {/* ── Floating Notification ── */}
        {notification && (
          <div className="floating-notification">
            <span className="notification-icon">✅</span>
            {notification}
          </div>
        )}

        {/* Page content */}
        <div className="page-content">

          {activeNav === "Check Warranty" && (
            <div className="warranty-section" style={{ animation: 'none', border: 'none', boxShadow: 'none', padding: 0 }}>
              <div className="section-header">
                <div className="section-title">Machine Warranty Overview</div>
              </div>

              {warrantyLoading ? (
                /* ── SKELETON LOADING STATE ── */
                <div className="warranty-skeleton-wrap">
                  <div className="skeleton-status-bar">
                    <span className="skeleton-pulse-dot" />
                    <span className="skeleton-status-text">Scanning machine database for warranty status (5s delay)…</span>
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
                /* ── REAL DATA (Sharing same UI as dashboard button) ── */
                <div className="warranty-data-appear">
                  {/* Controls */}
                  <div className="warranty-controls">
                    <div className="search-wrapper">
                      <span className="search-icon">{icons.search}</span>
                      <input
                        id="warranty-search-tab"
                        type="text"
                        placeholder="Search by Machine ID…"
                        value={searchTerm}
                        onChange={e => { setSearchTerm(e.target.value); setWarrantyPage(0) }}
                        className="search-input"
                      />
                    </div>

                    <select
                      id="warranty-filter-tab"
                      value={filter}
                      onChange={e => { setFilter(e.target.value); setWarrantyPage(0) }}
                      className="filter-select"
                    >
                      <option value="all">All Status</option>
                      <option value="active">In Warranty</option>
                      <option value="expired">Expired</option>
                    </select>
                  </div>

                  {/* Machine grid */}
                  <div className="warranty-grid">
                    {(() => {
                      const PAGE_SIZE = 12;
                      const filtered = warrantyData
                        .filter(m => m.machine_id.toString().toLowerCase().includes(searchTerm.toLowerCase()))
                        .filter(m =>
                          filter === "all" ? true
                            : filter === "active" ? m.status === "In Warranty"
                              : m.status === "Expired"
                        );

                      const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
                      const pageItems = filtered.slice(warrantyPage * PAGE_SIZE, (warrantyPage + 1) * PAGE_SIZE);

                      if (pageItems.length === 0) {
                        return (
                          <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "40px 0", color: "#94a3b8" }}>
                            <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
                            No machines found for your search or filter criteria.
                          </div>
                        );
                      }

                      return (
                        <>
                          {pageItems.map((machine, idx) => {
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
                          })}

                          {/* Pagination Controls */}
                          {totalPages > 1 && (
                            <div className="agent-pagination" style={{ gridColumn: "1 / -1", marginTop: 24 }}>
                              <button
                                className="page-btn"
                                disabled={warrantyPage === 0}
                                onClick={() => setWarrantyPage(p => p - 1)}
                              >
                                ← Prev
                              </button>

                              {Array.from({ length: totalPages }).map((_, i) => (
                                <button
                                  key={i}
                                  className={`page-btn ${i === warrantyPage ? "page-btn-active" : ""}`}
                                  onClick={() => setWarrantyPage(i)}
                                >
                                  {i + 1}
                                </button>
                              ))}

                              <button
                                className="page-btn"
                                disabled={warrantyPage >= totalPages - 1}
                                onClick={() => setWarrantyPage(p => p + 1)}
                              >
                                Next →
                              </button>

                              <span className="page-info" style={{ marginLeft: 'auto' }}>
                                {warrantyPage * PAGE_SIZE + 1}–{Math.min((warrantyPage + 1) * PAGE_SIZE, filtered.length)} of {filtered.length}
                              </span>
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </div>
                </div>
              )}
            </div>
          )}
          {activeNav === "Dashboard" && (
            <>

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
              </div>

              {/* ── AGENT INTELLIGENCE OVERVIEW ────────────────── */}
              <div className="section-header">
                <div className="section-title">Agent Intelligence Overview</div>
              </div>

              <div className="agent-overview-grid">
                <div className="agent-info-card">
                  <div className="agent-info-header">
                    <div className="agent-info-icon">🤖</div>
                    <div className="agent-info-title">Machinery Performance</div>
                  </div>
                  <div className="agent-info-desc">
                    ML-powered anomaly detection analyzing real-time sensor data to predict and classify machine failures.
                  </div>
                  <div className="agent-stats-grid">
                    <div className="agent-stat-item">
                      <span className="agent-stat-label">Anomalies</span>
                      <span className="agent-stat-value" style={{ color: '#f97316' }}>{anomalies.filter(a => a.status !== 'resolved').length}</span>
                    </div>
                    <div className="agent-stat-item">
                      <span className="agent-stat-label">Operational</span>
                      <span className="agent-stat-value" style={{ color: '#10b981' }}>{anomalies.filter(a => (a.report_id % 3) === 0).length}</span>
                    </div>
                    <div className="agent-stat-item">
                      <span className="agent-stat-label">Malfunctioning</span>
                      <span className="agent-stat-value" style={{ color: '#b45309' }}>{anomalies.filter(a => (a.report_id % 3) === 1).length}</span>
                    </div>
                    <div className="agent-stat-item">
                      <span className="agent-stat-label">Down</span>
                      <span className="agent-stat-value" style={{ color: '#ef4444' }}>{anomalies.filter(a => (a.report_id % 3) === 2).length}</span>
                    </div>
                    <div className="agent-stat-item full">
                      <span className="agent-stat-label">Total Economic Impact</span>
                      <span className="agent-stat-value">${anomalies.reduce((sum, a) => sum + (a.economic_impact || 0), 0).toLocaleString()}</span>
                    </div>
                  </div>
                  <button
                    className="agent-deep-dive-btn"
                    onClick={() => setActiveNav("Machinery Performance")}
                  >
                    Deep Dive Dashboard →
                  </button>
                </div>

                <div className="agent-info-card">
                  <div className="agent-info-header">
                    <div className="agent-info-icon">⚡</div>
                    <div className="agent-info-title">Asset Maintenance</div>
                  </div>
                  <div className="agent-info-desc">
                    Strategic efficiency optimizer designed to reduce energy consumption and maximize throughput across plants.
                  </div>
                  <div className="agent-stats-grid">
                    <div className="agent-stat-item">
                      <span className="agent-stat-label">Replacement</span>
                      <span className="agent-stat-value" style={{ color: '#ef4444' }}>{rfpData.length}</span>
                    </div>
                    <div className="agent-stat-item">
                      <span className="agent-stat-label">Maintenance</span>
                      <span className="agent-stat-value" style={{ color: '#f97316' }}>{maintenanceData.length}</span>
                    </div>
                    <div className="agent-stat-item">
                      <span className="agent-stat-label">Healthy</span>
                      <span className="agent-stat-value" style={{ color: '#10b981' }}>{healthyMachines.length}</span>
                    </div>
                    <div className="agent-stat-item">
                      <span className="agent-stat-label">Total Assets</span>
                      <span className="agent-stat-value" style={{ color: '#3b8ee8' }}>{healthyMachines.length + maintenanceData.length + rfpData.length}</span>
                    </div>
                    <div className="agent-stat-item full">
                      <span className="agent-stat-label">Est. Replacement Value</span>
                      <span className="agent-stat-value">${rfpData.reduce((sum, item) => sum + (Number(item.purchase_cost) || 0), 0).toLocaleString()}</span>
                    </div>
                  </div>
                  <button
                    className="agent-deep-dive-btn"
                    onClick={() => setActiveNav("Asset Maintenance")}
                  >
                    Deep Dive Dashboard →
                  </button>
                </div>

                <div className="agent-info-card">
                  <div className="agent-info-header">
                    <div className="agent-info-icon">📦</div>
                    <div className="agent-info-title">Spare-Parts Checker</div>
                  </div>
                  <div className="agent-info-desc">
                    Predictive maintenance for inventory management, ensuring spare parts are available before critical failures.
                  </div>
                  <div className="agent-stats-grid">
                    <div className="agent-stat-item">
                      <span className="agent-stat-label">Critical Stock</span>
                      <span className="agent-stat-value" style={{ color: '#ef4444' }}>{lowStockData.length}</span>
                    </div>
                    <div className="agent-stat-item">
                      <span className="agent-stat-label">Reorder</span>
                      <span className="agent-stat-value" style={{ color: '#f97316' }}>{reorderSoonData.length}</span>
                    </div>
                    <div className="agent-stat-item">
                      <span className="agent-stat-label">Claims</span>
                      <span className="agent-stat-value" style={{ color: '#a855f7' }}>{warrantyClaimData.length}</span>
                    </div>
                    <div className="agent-stat-item">
                      <span className="agent-stat-label">Sufficient</span>
                      <span className="agent-stat-value" style={{ color: '#10b981' }}>{sufficientStockData.length}</span>
                    </div>
                    <div className="agent-stat-item full">
                      <span className="agent-stat-label">Inventory at Risk</span>
                      <span className="agent-stat-value">${[...lowStockData, ...reorderSoonData, ...sufficientStockData].reduce((sum, item) => sum + (Number(item.part_cost) || 0), 0).toLocaleString()}</span>
                    </div>
                  </div>
                  <button
                    className="agent-deep-dive-btn"
                    onClick={() => setActiveNav("Spare-Parts Checker")}
                  >
                    Deep Dive Dashboard →
                  </button>
                </div>
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
                onClick={() => handleWarrantyFetch(600)}
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
                            onChange={e => { setSearchTerm(e.target.value); setWarrantyPage(0) }}
                            className="search-input"
                          />
                        </div>

                        <select
                          id="warranty-filter"
                          value={filter}
                          onChange={e => { setFilter(e.target.value); setWarrantyPage(0) }}
                          className="filter-select"
                        >
                          <option value="all">All Status</option>
                          <option value="active">In Warranty</option>
                          <option value="expired">Expired</option>
                        </select>
                      </div>

                      {/* Machine grid */}
                      <div className="warranty-grid">
                        {(() => {
                          const PAGE_SIZE = 12;
                          const filtered = warrantyData
                            .filter(m => m.machine_id.toString().toLowerCase().includes(searchTerm.toLowerCase()))
                            .filter(m =>
                              filter === "all" ? true
                                : filter === "active" ? m.status === "In Warranty"
                                  : m.status === "Expired"
                            );

                          const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
                          const pageItems = filtered.slice(warrantyPage * PAGE_SIZE, (warrantyPage + 1) * PAGE_SIZE);

                          if (pageItems.length === 0) {
                            return (
                              <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "40px 0", color: "#94a3b8" }}>
                                <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
                                No machines found for your search or filter criteria.
                              </div>
                            );
                          }

                          return (
                            <>
                              {pageItems.map((machine, idx) => {
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
                              })}

                              {/* Pagination Controls */}
                              {totalPages > 1 && (
                                <div className="agent-pagination" style={{ gridColumn: "1 / -1", marginTop: 24 }}>
                                  <button
                                    className="page-btn"
                                    disabled={warrantyPage === 0}
                                    onClick={() => setWarrantyPage(p => p - 1)}
                                  >
                                    ← Prev
                                  </button>

                                  {Array.from({ length: totalPages }).map((_, i) => (
                                    <button
                                      key={i}
                                      className={`page-btn ${i === warrantyPage ? "page-btn-active" : ""}`}
                                      onClick={() => setWarrantyPage(i)}
                                    >
                                      {i + 1}
                                    </button>
                                  ))}

                                  <button
                                    className="page-btn"
                                    disabled={warrantyPage >= totalPages - 1}
                                    onClick={() => setWarrantyPage(p => p + 1)}
                                  >
                                    Next →
                                  </button>

                                  <span className="page-info" style={{ marginLeft: 'auto' }}>
                                    {warrantyPage * PAGE_SIZE + 1}–{Math.min((warrantyPage + 1) * PAGE_SIZE, filtered.length)} of {filtered.length}
                                  </span>
                                </div>
                              )}
                            </>
                          );
                        })()}
                      </div>
                    </div>
                  )}
                </div>
              )}



            </>
          )}

          {activeNav === "Machinery Performance" && (() => {
            const activeAnomalies = anomalies.filter(a => a.status !== "resolved")
            const resolvedAnomalies = anomalies.filter(a => a.status === "resolved")

            return (
              <div className="agent-section">

                {/* ── Header row ── */}
                <div className="section-header" style={{ marginBottom: 20 }}>
                  <div className="section-title">Machinery Performance</div>
                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <button
                      onClick={runAgent}
                      className={`warranty-trigger-btn ${agentLoading ? "loading" : ""}`}
                      disabled={agentLoading}
                      style={{ margin: 0, height: "40px", padding: "0 20px" }}
                    >
                      {agentLoading ? <span className="btn-spinner" /> : "▶"}
                      <span style={{ marginLeft: agentLoading ? 8 : 4 }}>
                        {agentLoading ? "Running Agent…" : "Run Agent"}
                      </span>
                    </button>
                    <a
                      href={allAnomaliesMailto}
                      className="show-more-btn btn-summary-email"
                      style={{
                        margin: 0,
                        height: "40px",
                        display: "flex",
                        alignItems: "center",
                        textDecoration: "none"
                      }}
                    >
                      ✉ Send Summary Email
                    </a>
                    <button
                      onClick={deleteAllIssues}
                      className="show-more-btn"
                      style={{
                        margin: 0,
                        height: "40px",
                        display: "flex",
                        alignItems: "center",
                        background: "#dc2626",
                        color: "#fff",
                        borderColor: "#dc2626"
                      }}
                    >
                      🗑 Delete All
                    </button>
                  </div>
                </div>

                {/* ── Active Anomaly Banner ── */}
                {activeAnomalies.length > 0 && (
                  <div className="skeleton-status-bar" style={{ marginBottom: 20 }}>
                    <span className="skeleton-pulse-dot" style={{ background: "#f97316" }} />
                    <span className="skeleton-status-text" style={{ color: "#c2410c" }}>
                      {activeAnomalies.length} active anomaly{activeAnomalies.length !== 1 ? "s" : ""} detected
                    </span>
                  </div>
                )}

                {/* ── Detailed Table View ── */}
                <div className="agent-table-wrapper">
                  <table className="agent-table">
                    <thead>
                      <tr>
                        <th>Machine ID</th>
                        <th>Summary</th>
                        <th>Detected Issue</th>
                        <th>Status</th>
                        <th>Recommendation</th>
                        <th>QR-CODE</th>
                      </tr>
                    </thead>
                    <tbody>
                      {anomalies.map((item) => {
                        // Seeded random to prevent flicker (using report_id or machine_id)
                        const statusSeed = (item.report_id || 0) % 3;
                        const randomStatus = [
                          { label: "Operational", class: "status-op" },
                          { label: "Malfunctioning", class: "status-mal" },
                          { label: "Down", class: "status-down" }
                        ][statusSeed];

                        return (
                          <tr key={item.report_id}>
                            <td className="machine-id-cell">{item.machine_id}</td>
                            <td>{item.issue_summary || "—"}</td>
                            <td>{item.root_cause_prediction || "ML Predicted Fault"}</td>
                            <td>
                              <span className={`status-badge ${randomStatus.class}`}>
                                {randomStatus.label}
                              </span>
                            </td>
                            <td>{item.buyer_recommendation || "Needs Review"}</td>
                            <td>
                              <button
                                className="scan-me-btn"
                                onClick={() => setSelectedQRCode({
                                  id: item.machine_id,
                                  summary: item.issue_summary || "—",
                                  issue: item.root_cause_prediction || "ML Predicted Fault",
                                  status: randomStatus.label,
                                  recommendation: item.buyer_recommendation || "Needs Review"
                                })}
                              >
                                scan me
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* ── Actions Needed Table ── */}
                <div className="section-header" style={{ marginTop: 40, marginBottom: 16 }}>
                  <div className="section-title">Actions Needed</div>
                </div>
                <div className="agent-table-wrapper">
                  <table className="agent-table">
                    <thead>
                      <tr>
                        <th>Machine ID</th>
                        <th>Warranty</th>
                        <th>Actions Needed</th>
                      </tr>
                    </thead>
                    <tbody>
                      {actionsNeeded.length > 0 ? (
                        actionsNeeded.map((item) => {
                          // Try to find machine in the real warranty data fetched from API
                          const realMachine = warrantyData.find(m => m.machine_id === item.machine_id);

                          // Use real data if found, otherwise fallback to seeded logic
                          const statusLabel = realMachine ? realMachine.status : ((item.report_id % 2) === 0 ? "In Warranty" : "Expired");
                          const isExpired = statusLabel === "Expired";

                          return (
                            <tr key={`action-${item.report_id}`}>
                              <td className="machine-id-cell">{item.machine_id}</td>
                              <td>
                                <span className={`status-badge ${isExpired ? "status-expired" : "status-active"}`}>
                                  {statusLabel}
                                </span>
                              </td>
                              <td>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                  {isExpired ? (
                                    <button
                                      className="anomaly-btn anomaly-btn-rfp"
                                      style={{ maxWidth: '140px', fontWeight: 600 }}
                                      onClick={() => alert(`RFP process initiated for Machine ${item.machine_id}`)}
                                    >
                                      📄 Issue an RFP
                                    </button>
                                  ) : (
                                    <button
                                      className="anomaly-btn anomaly-btn-confirm"
                                      style={{ maxWidth: '140px', fontWeight: 600 }}
                                      onClick={() => alert(`Repair order initiated for Machine ${item.machine_id}`)}
                                    >
                                      🔧 Order Repair
                                    </button>
                                  )}
                                  <button
                                    className="anomaly-btn anomaly-btn-resolve"
                                    style={{ maxWidth: '140px', fontWeight: 600 }}
                                    onClick={() => resolveIssue(item.report_id)}
                                  >
                                    ✔ Resolved
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={3} style={{ textAlign: 'center', padding: '24px', color: '#94a3b8' }}>
                            No pending actions. Confirm a machine fault to add it here.
                          </td>
                        </tr>
                      )}
                    </tbody>

                  </table>
                </div>

                {/* ════════════════════════════════════════════════
                    RESOLVED SECTION
                    ════════════════════════════════════════════════ */}
                {resolvedAnomalies.length > 0 && (
                  <div className="resolved-section">
                    <div className="resolved-header">
                      <span className="resolved-title">✔ Resolved</span>
                      <span className="resolved-count">{resolvedAnomalies.length} machine{resolvedAnomalies.length !== 1 ? "s" : ""}</span>
                    </div>

                    <div className="agent-grid">
                      {resolvedAnomalies.map((item, idx) => (
                        <div
                          key={item.report_id}
                          className="anomaly-card anomaly-card-resolved warranty-card-enter"
                          style={{ animationDelay: `${idx * 50}ms` }}
                        >
                          <div className="anomaly-card-header">
                            <div>
                              <div className="machine-id">Machine ID: {item.machine_id}</div>
                              <div className="status-badge status-active" style={{ marginTop: 4 }}>
                                Resolved
                              </div>
                            </div>
                            <div className="prob-badge" style={{ borderColor: "#10b981", color: "#10b981" }}>
                              {Math.round(Number(item.predicted_probability) * 100)}%
                            </div>
                          </div>
                          <div className="anomaly-card-body">
                            <div className="anomaly-meta-row">
                              <span className="machine-meta-label">Economic Impact</span>
                              <span style={{ fontWeight: 600 }}>${item.economic_impact?.toFixed(2) ?? "—"}</span>
                            </div>
                            {item.issue_summary && (
                              <div className="anomaly-summary">{item.issue_summary}</div>
                            )}
                          </div>
                          <div className="anomaly-card-actions">
                            <button
                              className="anomaly-btn anomaly-btn-delete"
                              onClick={() => deleteIssue(item.report_id)}
                            >
                              ✕ Remove
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            )
          })()}

          {activeNav === "Asset Maintenance" && (
            <div className="agent-section">

              <div className="section-header" style={{ marginBottom: 20 }}>
                <div className="section-title">Asset Maintenance</div>

                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <button
                    onClick={runAgent2}
                    className={`warranty-trigger-btn ${agentLoading ? "loading" : ""}`}
                    disabled={agentLoading}
                    style={{ margin: 0, height: "40px", padding: "0 20px" }}
                  >
                    {agentLoading ? <span className="btn-spinner" /> : "▶"}
                    <span style={{ marginLeft: agentLoading ? 8 : 4 }}>
                      {agentLoading ? "Running Agent…" : "Run Agent"}
                    </span>
                  </button>

                  <button
                    onClick={deleteAllAgent2}
                    className="show-more-btn"
                    style={{
                      margin: 0,
                      height: "40px",
                      display: "flex",
                      alignItems: "center",
                      background: "#dc2626",
                      color: "#fff",
                      borderColor: "#dc2626"
                    }}
                  >
                    🗑 Delete All
                  </button>
                </div>
              </div>

              {/* ── Agent 2 Overview Cards ───────────────────── */}
              <div className="agent-overview-grid" style={{ marginBottom: 30 }}>

                <div className="agent-info-card warranty-card-enter">
                  <div className="agent-info-header">
                    <div className="agent-info-icon">📄</div>
                    <div className="agent-info-title">RFP Generated</div>
                  </div>
                  <div className="agent-info-desc">
                    Machines reaching end-of-life and requiring procurement action.
                  </div>
                  <div className="agent-stat-item full">
                    <span className="agent-stat-value" style={{ color: "#ef4444" }}>
                      {rfpData.length}
                    </span>
                  </div>
                </div>

                <div className="agent-info-card warranty-card-enter">
                  <div className="agent-info-header">
                    <div className="agent-info-icon">🛠</div>
                    <div className="agent-info-title">Scheduled Maintenance</div>
                  </div>
                  <div className="agent-info-desc">
                    Preventive maintenance tasks auto-generated by lifecycle rules.
                  </div>
                  <div className="agent-stat-item full">
                    <span className="agent-stat-value" style={{ color: "#f97316" }}>
                      {maintenanceData.length}
                    </span>
                  </div>
                </div>

                <div className="agent-info-card warranty-card-enter">
                  <div className="agent-info-header">
                    <div className="agent-info-icon">✅</div>
                    <div className="agent-info-title">Healthy Assets</div>
                  </div>
                  <div className="agent-info-desc">
                    Machines operating within safe lifecycle thresholds.
                  </div>
                  <div className="agent-stat-item full">
                    <span className="agent-stat-value" style={{ color: "#10b981" }}>
                      {healthyMachines.length}
                    </span>
                  </div>
                </div>

              </div>

              {/* Depreciation Monitor UI */}
              {depreciationStats && (
                <>
                  <div className="section-header" style={{ marginTop: 30 }}>
                    <div className="section-title">Depreciation Monitor</div>
                  </div>

                  {/* KPI Cards */}
                  <div className="agent-overview-grid" style={{ marginBottom: 30 }}>

                    <div className="agent-info-card">
                      <div className="agent-info-title">Asset Count</div>
                      <div className="agent-stat-value" style={{ color: "#3b8ee8" }}>
                        {depreciationStats.totalAssets}
                      </div>
                    </div>

                    <div className="agent-info-card">
                      <div className="agent-info-title">Total Asset Value</div>
                      <div className="agent-stat-value">
                        ${depreciationStats.totalPurchaseValue.toLocaleString()}
                      </div>
                    </div>

                    <div className="agent-info-card">
                      <div className="agent-info-title">Average Depreciation Rate</div>
                      <div className="agent-stat-value" style={{ color: "#f97316" }}>
                        {depreciationStats.avgDepPercent}%
                      </div>
                    </div>

                    <div className="agent-info-card">
                      <div className="agent-info-title">Assets &gt; 80% Depreciation</div>
                      <div className="agent-stat-value" style={{ color: "#ef4444" }}>
                        {depreciationStats.highDepCount}
                      </div>
                    </div>

                  </div>

                  {/* Depreciation Chart */}
                  <div className="chart-card" style={{ marginBottom: 30 }}>
                    <h3 style={{ marginBottom: 20 }}>Depreciation Distribution</h3>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={depreciationBuckets}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="value" fill="#3b8ee8" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </>
              )}

              {/* ───────────────────────────────────────────── */}
              {/* RFP GENERATED TABLE */}
              {/* ───────────────────────────────────────────── */}
              <div className="section-header" style={{ marginBottom: 12 }}>
                <div className="section-title">Replacement Candidates</div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  {(() => {
                    const combinedReplacementData = [
                      ...rfpData.map(item => ({ ...item, _source: "rfp" })),
                      ...poData.map(item => ({ ...item, _source: "po" }))
                    ]
                    const filteredData = combinedReplacementData.filter(i => i.machine_id?.toLowerCase().includes(rfpSearch.toLowerCase()))
                    return (
                      <>
                        {rfpSearch && (
                          <span style={{ fontSize: 12, color: 'var(--grey-400)', fontWeight: 600 }}>
                            {filteredData.length} results
                          </span>
                        )}
                      </>
                    )
                  })()}
                  <div className="search-wrapper" style={{ width: 280 }}>
                    <span className="search-icon">{icons.search}</span>
                    <input
                      type="text"
                      placeholder="Filter by Machine ID…"
                      value={rfpSearch}
                      onChange={e => setRfpSearch(e.target.value)}
                      className="search-input"
                    />
                  </div>
                </div>
              </div>

              {(() => {
                const combinedReplacementData = [
                  ...rfpData.map(item => ({ ...item, _source: "rfp" })),
                  ...poData.map(item => ({ ...item, _source: "po" }))
                ]
                const filteredData = combinedReplacementData
                  .filter(item => item.machine_id?.toLowerCase().includes(rfpSearch.toLowerCase()))
                  .sort((a, b) => String(a.machine_id).localeCompare(String(b.machine_id), undefined, { numeric: true }))

                return (
                  <div className="agent-table-wrapper">
                    <table className="agent-table">
                      <thead>
                        <tr>
                          <th>Machine ID</th>
                          <th>Machine Type</th>
                          <th>Remaining Life</th>
                          <th>Depreciation %</th>
                          <th>Purchase Cost</th>
                          <th>Priority</th>
                          <th>RFP DOC</th>
                          <th>PO DOC</th>
                          <th>TAKE ACTION</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredData.length > 0 ? (
                          filteredData
                            .map((item) => (
                              <tr key={item.id}>
                                <td>{item.machine_id}</td>
                                <td>{item.machine_type}</td>
                                <td>{item.predicted_remaining_life} yrs</td>
                                <td>{item.depreciation_percent}%</td>
                                <td>${item.purchase_cost?.toLocaleString()}</td>
                                <td>
                                  <span
                                    className="status-badge"
                                    style={{
                                      background: item.priority?.toLowerCase().includes("critical") ? "rgba(239, 68, 68, 0.1)" :
                                        item.priority?.toLowerCase().includes("high") ? "rgba(249, 115, 22, 0.1)" :
                                          "rgba(16, 185, 129, 0.1)",
                                      color: item.priority?.toLowerCase().includes("critical") ? "#ef4444" :
                                        item.priority?.toLowerCase().includes("high") ? "#f97316" :
                                          "#10b981",
                                      border: `1px solid ${item.priority?.toLowerCase().includes("critical") ? "rgba(239, 68, 68, 0.2)" :
                                        item.priority?.toLowerCase().includes("high") ? "rgba(249, 115, 22, 0.2)" :
                                          "rgba(16, 185, 129, 0.2)"
                                        }`
                                    }}
                                  >
                                    {item.priority}
                                  </span>
                                </td>
                                <td>
                                  {item._source === "rfp" ? (
                                    <button
                                      className="anomaly-btn anomaly-btn-confirm"
                                      onClick={() => downloadRfpFile(item)}
                                    >
                                      ⬇ RFP
                                    </button>
                                  ) : (
                                    <span style={{ color: "#94a3b8" }}>—</span>
                                  )}
                                </td>
                                <td>
                                  {item._source === "po" ? (
                                    <button
                                      className="anomaly-btn anomaly-btn-confirm"
                                      onClick={() => downloadPoFile(item)}
                                    >
                                      ⬇ PO
                                    </button>
                                  ) : (
                                    <span style={{ color: "#94a3b8" }}>—</span>
                                  )}
                                </td>
                                <td>
                                  {item._source === "rfp" ? (
                                    <button
                                      className="anomaly-btn anomaly-btn-confirm"
                                      style={{ background: "var(--blue-600)", color: "#fff", borderColor: "var(--blue-700)" }}
                                      onClick={() => sendRfpEmail(item)}
                                    >
                                      ✉ Send RFP
                                    </button>
                                  ) : (
                                    <button
                                      className="anomaly-btn anomaly-btn-confirm"
                                      style={{ background: "#16a34a", color: "#fff" }}
                                      onClick={() => sendPoEmail(item)}
                                    >
                                      ✉ Send PO
                                    </button>
                                  )}
                                </td>
                              </tr>
                            ))
                        ) : (
                          <tr>
                            <td colSpan={9} style={{ textAlign: "center", padding: 40, color: "var(--grey-400)" }}>
                              <div style={{ fontSize: 24, marginBottom: 8 }}>🔍</div>
                              {rfpSearch ? `No results found for "${rfpSearch}"` : "No RFPs or POs generated yet."}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )
              })()}

              {/* ───────────────────────────────────────────── */}
              {/* MAINTENANCE TABLE */}
              {/* ───────────────────────────────────────────── */}
              <div className="section-header" style={{ marginTop: 40, marginBottom: 12 }}>
                <div className="section-title">Scheduled Maintenance</div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  {maintenanceSearch && (
                    <span style={{ fontSize: 12, color: "var(--grey-400)", fontWeight: 600 }}>
                      {maintenanceData.filter(i => i.machine_id?.toLowerCase().includes(maintenanceSearch.toLowerCase())).length} results
                    </span>
                  )}
                  <div className="search-wrapper" style={{ width: 280 }}>
                    <span className="search-icon">{icons.search}</span>
                    <input
                      type="text"
                      placeholder="Filter by Machine ID…"
                      value={maintenanceSearch}
                      onChange={e => setMaintenanceSearch(e.target.value)}
                      className="search-input"
                    />
                  </div>
                </div>
              </div>

              <div className="agent-table-wrapper">
                <table className="agent-table">
                  <thead>
                    <tr>
                      <th>Machine ID</th>
                      <th>Remaining Life</th>
                      <th>Scheduled Date</th>
                      <th>Priority</th>
                    </tr>
                  </thead>
                  <tbody>
                    {maintenanceData.filter(item => item.machine_id?.toLowerCase().includes(maintenanceSearch.toLowerCase())).length > 0 ? (
                      maintenanceData
                        .filter(item => item.machine_id?.toLowerCase().includes(maintenanceSearch.toLowerCase()))
                        .map((item) => (
                          <tr key={item.schedule_id}>
                            <td>{item.machine_id}</td>
                            <td>{item.predicted_remaining_life} yrs</td>
                            <td>
                              {item.scheduled_date
                                ? item.scheduled_date.split("T")[0]
                                : "—"}
                            </td>
                            <td>
                              <span
                                className="status-badge"
                                style={{
                                  background: item.priority?.toLowerCase().includes("critical") ? "rgba(239, 68, 68, 0.1)" :
                                    item.priority?.toLowerCase().includes("high") ? "rgba(249, 115, 22, 0.1)" :
                                      item.priority?.toLowerCase().includes("medium") ? "rgba(59, 130, 246, 0.1)" :
                                        "rgba(16, 185, 129, 0.1)",
                                  color: item.priority?.toLowerCase().includes("critical") ? "#ef4444" :
                                    item.priority?.toLowerCase().includes("high") ? "#f97316" :
                                      item.priority?.toLowerCase().includes("medium") ? "#3b82f6" :
                                        "#10b981",
                                  border: `1px solid ${item.priority?.toLowerCase().includes("critical") ? "rgba(239, 68, 68, 0.2)" :
                                    item.priority?.toLowerCase().includes("high") ? "rgba(249, 115, 22, 0.2)" :
                                      item.priority?.toLowerCase().includes("medium") ? "rgba(59, 130, 246, 0.2)" :
                                        "rgba(16, 185, 129, 0.2)"
                                    }`
                                }}
                              >
                                {item.priority || "Normal"}
                              </span>
                            </td>
                          </tr>
                        ))
                    ) : (
                      <tr>
                        <td colSpan={4} style={{ textAlign: "center", padding: 40, color: "var(--grey-400)" }}>
                          <div style={{ fontSize: 24, marginBottom: 8 }}>🔍</div>
                          {maintenanceSearch ? `No results found for "${maintenanceSearch}"` : "No maintenance scheduled."}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* ───────────────────────────────────────────── */}
              {/* HEALTHY MACHINES TABLE */}
              {/* ───────────────────────────────────────────── */}
              <div className="section-header" style={{ marginTop: 40, marginBottom: 12 }}>
                <div className="section-title">Healthy Assets</div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  {healthySearch && (
                    <span style={{ fontSize: 12, color: "var(--grey-400)", fontWeight: 600 }}>
                      {healthyMachines.filter(i => i.machine_id?.toLowerCase().includes(healthySearch.toLowerCase())).length} results
                    </span>
                  )}
                  <div className="search-wrapper" style={{ width: 280 }}>
                    <span className="search-icon">{icons.search}</span>
                    <input
                      type="text"
                      placeholder="Filter by Machine ID…"
                      value={healthySearch}
                      onChange={e => setHealthySearch(e.target.value)}
                      className="search-input"
                    />
                  </div>
                </div>
              </div>

              <div className="agent-table-wrapper">
                <table className="agent-table">
                  <thead>
                    <tr>
                      <th>Machine ID</th>
                      <th>Machine Name</th>
                      <th>Machine Type</th>
                      <th>Remaining Life</th>
                      <th>Depreciation %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {healthyMachines.filter(item => item.machine_id?.toLowerCase().includes(healthySearch.toLowerCase())).length > 0 ? (
                      healthyMachines
                        .filter(item => item.machine_id?.toLowerCase().includes(healthySearch.toLowerCase()))
                        .map((item) => (
                          <tr key={item.id}>
                            <td>{item.machine_id}</td>
                            <td>{item.machine_name}</td>
                            <td>{item.machine_type}</td>
                            <td>{item.predicted_remaining_life} yrs</td>
                            <td>{item.depreciation_percent}%</td>
                          </tr>
                        ))
                    ) : (
                      <tr>
                        <td colSpan={5} style={{ textAlign: "center", padding: 40, color: "var(--grey-400)" }}>
                          <div style={{ fontSize: 24, marginBottom: 8 }}>🔍</div>
                          {healthySearch ? `No results found for "${healthySearch}"` : "No healthy assets recorded."}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

            </div>
          )}

          {activeNav === "Spare-Parts Checker" && (() => {

            const totalParts =
              lowStockData.length +
              warrantyClaimData.length +
              reorderSoonData.length +
              sufficientStockData.length

            const criticalCount = lowStockData.length

            const reorderCount = reorderSoonData.length

            const warrantyCount = warrantyClaimData.length

            const totalInventoryValue = [
              ...lowStockData,
              ...reorderSoonData,
              ...sufficientStockData
            ].reduce((sum, item) => sum + (Number(item.part_cost) || 0), 0)

            return (
              <div className="agent-section">

                <div className="section-header">
                  <div className="section-title">Spare-Parts Checker</div>
                </div>

                {/* ── SUPPLY CHAIN KPIs ───────────────────────── */}
                <div className="agent-overview-grid" style={{ marginTop: 20, marginBottom: 30 }}>

                  <div className="agent-info-card warranty-card-enter">
                    <div className="agent-info-title">Total Parts Monitored</div>
                    <div className="agent-stat-value" style={{ color: "#3b8ee8" }}>
                      {totalParts}
                    </div>
                  </div>

                  <div className="agent-info-card warranty-card-enter">
                    <div className="agent-info-title">Critical Low Stock</div>
                    <div className="agent-stat-value" style={{ color: "#ef4444" }}>
                      {criticalCount}
                    </div>
                  </div>

                  <div className="agent-info-card warranty-card-enter">
                    <div className="agent-info-title">Near Obsoletion</div>
                    <div className="agent-stat-value" style={{ color: "#f97316" }}>
                      {reorderCount}
                    </div>
                  </div>

                  <div className="agent-info-card warranty-card-enter">
                    <div className="agent-info-title">Warranty Claim Candidates</div>
                    <div className="agent-stat-value" style={{ color: "#a855f7" }}>
                      {warrantyCount}
                    </div>
                  </div>

                  <div className="agent-info-card warranty-card-enter">
                    <div className="agent-info-title">Inventory Value at Risk</div>
                    <div className="agent-stat-value">
                      ${totalInventoryValue.toLocaleString()}
                    </div>
                  </div>

                </div>

                {/* LOW STOCK TABLE */}
                <SectionTable
                  title="Low Stock (Critical)"
                  data={lowStockData}
                  excludeKeys={['part_name', 'stock_gap', 'risk_score', 'processed_at']}
                  renderActions={(item) => {
                    const subject = `[URGENT] Alert: Critical Low Stock for Machine ${item.machine_id}`
                    const body = `Hello Procurement Team,\n\nAutomated Alert: A critical low stock condition has been detected.\n\nDetails:\n- Machine ID: ${item.machine_id || 'N/A'}\n- Part ID: ${item.part_id || 'N/A'}\n- Current Stock: ${item.current_stock || '0'}\n- Minimum Required: ${item.minimum_required || '0'}\n\nPlease take immediate action to restock this part.\n\nRegards,\nPMCT Dashboard`
                    const mailto = `mailto:procurement@example.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`

                    return (
                      <a
                        href={mailto}
                        className="stock-alert-btn"
                      >
                        <span style={{ fontSize: 14 }}>✉</span>
                        <span>Send Alert</span>
                      </a>
                    )
                  }}
                />

                {/* WARRANTY CLAIM TABLE */}
                <SectionTable
                  title="Warranty Claim Candidates"
                  data={warrantyClaimData}
                  excludeKeys={['part_name', 'fail_count', 'risk_score', 'processed_at', 'reason']}
                  renderActions={(item) => {
                    const subject = `Claiming the warranty for Machine: ${item.machine_id} - Part ID: ${item.part_id}`
                    const body = `Dear Warranty Support Team,\n\nWe are writing to officially initiate a warranty claim for the following component:\n\nMachine Details:\n- Machine ID: ${item.machine_id || 'N/A'}\n- Part ID: ${item.part_id || 'N/A'}\n- Failure Description: [Automated Detection of Anomalous Behavior]\n\nAccording to our PMCT Control Tower logs, this part has failed or is showing critical signs of premature failure despite being within the valid warranty period.\n\nPlease provide instructions for the next steps, including any required RMA documentation or site inspection schedules.\n\nBest regards,\nPMCT Maintenance Tower`
                    const mailto = `mailto:warranty-claims@ofi-benelux.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`

                    return (
                      <a
                        href={mailto}
                        className="warranty-claim-btn"
                      >
                        <span className="warranty-claim-icon">🛡️</span>
                        <span className="warranty-claim-label">Claim Warranty</span>
                      </a>
                    )
                  }}
                />

                {/* NEAR OBSOLETION TABLE */}
                <SectionTable
                  title="Near Obsoletion"
                  data={reorderSoonData}
                  excludeKeys={['part_name', 'risk_score', 'processed_at', 'rfp_file_name', 'rfp_text']}
                  renderActions={(item) => {
                    const subject = `[ACTION REQUIRED] Near Obsoletion Alert — Part ${item.part_id} on Machine ${item.machine_id}`
                    const body = `Dear Procurement / Maintenance Team,\n\nOur PMCT Control Tower has flagged the following part as approaching obsoletion and requiring immediate attention.\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nPART DETAILS\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n- Machine ID: ${item.machine_id || 'N/A'}\n- Part ID: ${item.part_id || 'N/A'}\n- Current Stock: ${item.current_stock ?? 'N/A'}\n- Min Threshold: ${item.min_threshold ?? 'N/A'}\n- Lead Time (days): ${item.lead_time_days ?? 'N/A'}\n- Part Cost: ${item.part_cost ?? 'N/A'}\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nRFP / RECOMMENDATION\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n${item.rfp_text || 'No RFP text available.'}\n\nPlease review and initiate the procurement or replacement process at the earliest.\n\nBest regards,\nPMCT Control Tower`
                    const mailto = `mailto:procurement@ofi-benelux.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`

                    return (
                      <a
                        href={mailto}
                        className="stock-alert-btn"
                      >
                        <span style={{ fontSize: 14 }}>✉</span>
                        <span>Send Alert</span>
                      </a>
                    )
                  }}
                />

                {/* SUFFICIENT STOCK TABLE */}
                <SectionTable
                  title="Sufficient Stock"
                  data={sufficientStockData}
                  excludeKeys={['part_name', 'risk_score', 'processed_at']}
                />

              </div>
            )
          })()}

          {/* ═══════ TECHNICAL VIEW ═══════ */}
          {activeNav === "Technician View" && (
            <div className="technical-view-section">
              <div className="section-header">
                <div className="section-title">Technician View — Machine Intelligence Console</div>
              </div>

              {techLoading ? (
                <div className="warranty-skeleton-wrap">
                  <div className="skeleton-status-bar">
                    <span className="skeleton-pulse-dot" />
                    <span className="skeleton-status-text">Loading technical data from all agents…</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginTop: 24 }}>
                    {Array.from({ length: 8 }).map((_, i) => (
                      <div key={i} className="agent-info-card skeleton-card" style={{ animationDelay: `${i * 80}ms`, padding: 24 }}>
                        <div className="skeleton-line" style={{ width: "55%", height: 12, marginBottom: 10 }} />
                        <div className="skeleton-line" style={{ width: "35%", height: 22, marginBottom: 0 }} />
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  {/* ── Quick Stats Row ── */}
                  <div className="tech-stats-row">
                    <div className="tech-stat-card">
                      <div className="tech-stat-icon" style={{ background: 'rgba(59,142,232,0.12)' }}>⚙️</div>
                      <div><div className="tech-stat-label">Total Machines</div><div className="tech-stat-value">{techMachines.length}</div></div>
                    </div>
                    <div className="tech-stat-card">
                      <div className="tech-stat-icon" style={{ background: 'rgba(239,68,68,0.12)' }}>⚠️</div>
                      <div><div className="tech-stat-label">Failures Logged</div><div className="tech-stat-value" style={{ color: '#ef4444' }}>{techFailures.length}</div></div>
                    </div>
                    <div className="tech-stat-card">
                      <div className="tech-stat-icon" style={{ background: 'rgba(249,115,22,0.12)' }}>🔧</div>
                      <div><div className="tech-stat-label">Under Maintenance</div><div className="tech-stat-value" style={{ color: '#f97316' }}>{maintenanceData.length}</div></div>
                    </div>
                    <div className="tech-stat-card">
                      <div className="tech-stat-icon" style={{ background: 'rgba(16,185,129,0.12)' }}>✅</div>
                      <div><div className="tech-stat-label">Healthy Assets</div><div className="tech-stat-value" style={{ color: '#10b981' }}>{healthyMachines.length}</div></div>
                    </div>
                  </div>

                  {/* ─────────────────────────────────────────── */}
                  {/* TECHNICAL LIVE ANOMALY CONTROL PANEL       */}
                  {/* ─────────────────────────────────────────── */}

                  <div className="section-header" style={{ marginTop: 30 }}>
                    <div className="section-title">Live Anomaly Monitor</div>
                  </div>

                  {/* Search + Filter */}
                  <div className="warranty-controls" style={{ marginBottom: 20 }}>
                    <div className="search-wrapper">
                      <span className="search-icon">{icons.search}</span>
                      <input
                        type="text"
                        placeholder="Search by Machine ID…"
                        value={agentSearch}
                        onChange={e => {
                          setAgentSearch(e.target.value)
                          setAgentPage(0)
                        }}
                        className="search-input"
                      />
                    </div>

                    <select
                      value={agentFilter}
                      onChange={e => {
                        setAgentFilter(e.target.value)
                        setAgentPage(0)
                      }}
                      className="filter-select"
                    >
                      <option value="all">All Status</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="pending">Pending</option>
                    </select>
                  </div>

                  {/* Anomaly Cards + Pagination */}
                  {(() => {
                    const PAGE_SIZE = 6
                    const activeAnomalies = anomalies.filter(a => a.status !== "resolved")
                    const filtered = activeAnomalies
                      .filter(a => a.machine_id.toString().includes(agentSearch.trim()))
                      .filter(a =>
                        agentFilter === "all" ? true
                          : agentFilter === "confirmed" ? a.status === "confirmed"
                            : a.status !== "confirmed"
                      )
                    const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
                    const pageItems = filtered.slice(agentPage * PAGE_SIZE, (agentPage + 1) * PAGE_SIZE)

                    return (
                      <>
                        {/* Anomaly count banner */}
                        {activeAnomalies.length > 0 && (
                          <div className="skeleton-status-bar" style={{ marginBottom: 20 }}>
                            <span className="skeleton-pulse-dot" style={{ background: "#f97316" }} />
                            <span className="skeleton-status-text" style={{ color: "#c2410c" }}>
                              {activeAnomalies.length} active anomaly{activeAnomalies.length !== 1 ? "s" : ""} detected
                            </span>
                            {filtered.length !== activeAnomalies.length && (
                              <span style={{ marginLeft: "auto", fontSize: 12, color: "#94a3b8" }}>
                                Showing {filtered.length} filtered
                              </span>
                            )}
                          </div>
                        )}

                        {/* Empty state */}
                        {activeAnomalies.length === 0 && !agentLoading && (
                          <div className="agent-empty">
                            <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
                            <div style={{ fontWeight: 600, color: "#1e293b", marginBottom: 4 }}>No active anomalies</div>
                            <div style={{ fontSize: 13, color: "#94a3b8" }}>Run the agent to detect ML-predicted faults.</div>
                          </div>
                        )}

                        {/* 3-column Card Grid */}
                        {pageItems.length > 0 && (
                          <div className="agent-grid">
                            {pageItems.map((item: any, idx: number) => {
                              const isConfirmed = item.status === "confirmed"
                              const prob = Number(item.predicted_probability)
                              const probColor = prob >= 0.8 ? "#ef4444" : prob >= 0.5 ? "#f97316" : "#10b981"

                              return (
                                <div
                                  key={item.report_id}
                                  className="anomaly-card warranty-card-enter"
                                  style={{ animationDelay: `${idx * 60}ms` }}
                                >
                                  <div className="anomaly-card-header">
                                    <div>
                                      <div className="machine-id">Machine ID: {item.machine_id}</div>
                                      <div
                                        className="status-badge"
                                        style={{
                                          marginTop: 4,
                                          background: isConfirmed ? "rgba(16,185,129,0.1)" : "rgba(249,115,22,0.1)",
                                          color: isConfirmed ? "#059669" : "#c2410c",
                                          border: `1px solid ${isConfirmed ? "rgba(16,185,129,0.25)" : "rgba(249,115,22,0.25)"}`,
                                        }}
                                      >
                                        {isConfirmed ? "Confirmed" : "Pending"}
                                      </div>
                                    </div>
                                    <div className="prob-badge" style={{ borderColor: probColor, color: probColor }}>
                                      {Math.round(prob * 100)}%
                                    </div>
                                  </div>

                                  <div className="anomaly-card-body">
                                    <div className="anomaly-meta-row">
                                      <span className="machine-meta-label">Economic Impact</span>
                                      <span style={{ fontWeight: 600, color: "#1e293b" }}>
                                        ${item.economic_impact?.toFixed(2) ?? "—"}
                                      </span>
                                    </div>
                                    {item.issue_summary && (
                                      <div className="anomaly-summary">{item.issue_summary}</div>
                                    )}
                                  </div>

                                  <div className="anomaly-card-actions">
                                    <button
                                      className="anomaly-btn anomaly-btn-confirm"
                                      onClick={() => confirmIssue(item)}
                                      title={isConfirmed ? "Issue is already confirmed" : "Confirm this issue"}
                                      disabled={isConfirmed}
                                      style={{ opacity: isConfirmed ? 0.6 : 1, cursor: isConfirmed ? 'not-allowed' : 'pointer' }}
                                    >
                                      {isConfirmed ? "✓ Confirmed" : "✓ Confirm"}
                                    </button>
                                    <button
                                      className="anomaly-btn anomaly-btn-delete"
                                      onClick={() => deleteIssue(item.report_id)}
                                      title="Dismiss — not an issue"
                                    >
                                      ✕ Dismiss
                                    </button>
                                    <button
                                      className="anomaly-btn anomaly-btn-resolve"
                                      onClick={() => resolveIssue(item.report_id)}
                                      title="Mark as resolved"
                                    >
                                      ✔ Resolved
                                    </button>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        )}

                        {/* Pagination */}
                        {totalPages > 1 && (
                          <div className="agent-pagination">
                            <button
                              className="page-btn"
                              disabled={agentPage === 0}
                              onClick={() => setAgentPage(p => p - 1)}
                            >
                              ← Prev
                            </button>

                            {Array.from({ length: totalPages }).map((_: any, i: number) => (
                              <button
                                key={i}
                                className={`page-btn ${i === agentPage ? "page-btn-active" : ""}`}
                                onClick={() => setAgentPage(i)}
                              >
                                {i + 1}
                              </button>
                            ))}

                            <button
                              className="page-btn"
                              disabled={agentPage >= totalPages - 1}
                              onClick={() => setAgentPage(p => p + 1)}
                            >
                              Next →
                            </button>

                            <span className="page-info">
                              {agentPage * PAGE_SIZE + 1}–{Math.min((agentPage + 1) * PAGE_SIZE, filtered.length)} of {filtered.length}
                            </span>
                          </div>
                        )}
                      </>
                    )
                  })()}

                  {/* ── Tab Switcher ── */}
                  <div className="tech-tab-bar">
                    {(["machines", "failures", "inventory"] as const).map(tab => (
                      <button
                        key={tab}
                        className={`tech-tab-btn ${techTab === tab ? 'active' : ''}`}
                        onClick={() => { setTechTab(tab); setTechSearch("") }}
                      >
                        {tab === "machines" && "🖥️ Machine Registry"}
                        {tab === "failures" && "🔴 Failure History"}
                        {tab === "inventory" && "📦 Parts Inventory"}
                      </button>
                    ))}
                  </div>

                  {/* ── Search Bar ── */}
                  <div className="tech-search-row">
                    <div className="search-wrapper" style={{ width: 360 }}>
                      <span className="search-icon">{icons.search}</span>
                      <input
                        type="text"
                        placeholder={`Search ${techTab}…`}
                        value={techSearch}
                        onChange={e => setTechSearch(e.target.value)}
                        className="search-input"
                      />
                    </div>
                    {techSearch && (
                      <span style={{ fontSize: 12, color: 'var(--grey-400)', fontWeight: 600 }}>
                        Filtering results…
                      </span>
                    )}
                  </div>

                  {/* ── Machine Registry Tab ── */}
                  {techTab === "machines" && (() => {
                    const filtered = techMachines.filter(m =>
                      Object.values(m).some(v => String(v).toLowerCase().includes(techSearch.toLowerCase()))
                    )
                    const machineHeaders = techMachines.length > 0
                      ? Object.keys(techMachines[0]).filter(k => !['id', 'created_at', 'updated_at', 'warranty_expiry', 'install_date', 'purchase_cost', 'remaining_life'].includes(k))
                      : []

                    return (
                      <div className="agent-table-wrapper">
                        <table className="agent-table">
                          <thead>
                            <tr>
                              {machineHeaders.map(h => (
                                <th key={h}>{h.replace(/_/g, ' ').toUpperCase()}</th>
                              ))}
                              <th>WARRANTY</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filtered.length > 0 ? filtered.map((m, idx) => {
                              // Compute warranty inline
                              const installDate = m.install_date ? new Date(m.install_date) : null
                              let warrantyStatus = "—"
                              let warrantyColor = "var(--grey-400)"
                              if (installDate && m.expected_life_years) {
                                const expiry = new Date(installDate)
                                expiry.setFullYear(expiry.getFullYear() + m.expected_life_years)
                                const diffDays = Math.ceil((expiry.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
                                if (diffDays < 0) { warrantyStatus = "Expired"; warrantyColor = "#ef4444" }
                                else if (diffDays < 180) { warrantyStatus = "Expiring Soon"; warrantyColor = "#f97316" }
                                else { warrantyStatus = "Active"; warrantyColor = "#10b981" }
                              }
                              return (
                                <tr key={m.machine_id || idx}>
                                  {machineHeaders.map(h => (
                                    <td key={h}>{m[h]?.toString() || "—"}</td>
                                  ))}
                                  <td>
                                    <span style={{
                                      padding: '3px 10px', borderRadius: 999, fontSize: 11, fontWeight: 700,
                                      background: warrantyColor + '18', color: warrantyColor, letterSpacing: 0.5
                                    }}>
                                      {warrantyStatus}
                                    </span>
                                  </td>
                                </tr>
                              )
                            }) : (
                              <tr>
                                <td colSpan={machineHeaders.length + 1} style={{ textAlign: 'center', padding: 40, color: 'var(--grey-400)' }}>
                                  <div style={{ fontSize: 24, marginBottom: 8 }}>🔍</div>
                                  {techSearch ? `No machines match "${techSearch}".` : 'No machine data available.'}
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    )
                  })()}

                  {/* ── Failure History Tab ── */}
                  {techTab === "failures" && (() => {
                    const filtered = techFailures.filter(f =>
                      Object.values(f).some(v => String(v).toLowerCase().includes(techSearch.toLowerCase()))
                    )
                    const failHeaders = techFailures.length > 0
                      ? Object.keys(techFailures[0]).filter(k => !['id', 'created_at', 'updated_at', 'failure_id', 'total_loss'].includes(k))
                      : []

                    return (
                      <div className="agent-table-wrapper">
                        <table className="agent-table">
                          <thead>
                            <tr>
                              {failHeaders.map(h => (
                                <th key={h}>{h.replace(/_/g, ' ').toUpperCase()}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {filtered.length > 0 ? filtered.map((f, idx) => (
                              <tr key={f.failure_id || idx}>
                                {failHeaders.map(h => {
                                  let val = f[h]?.toString() || "—"
                                  // Highlight certain columns
                                  if (h === 'downtime_hours' && Number(f[h]) > 10) {
                                    return <td key={h} style={{ color: '#ef4444', fontWeight: 700 }}>{val}</td>
                                  }
                                  if (h === 'failure_date') {
                                    return <td key={h}>{val.split('T')[0]}</td>
                                  }
                                  return <td key={h}>{val}</td>
                                })}
                              </tr>
                            )) : (
                              <tr>
                                <td colSpan={failHeaders.length} style={{ textAlign: 'center', padding: 40, color: 'var(--grey-400)' }}>
                                  <div style={{ fontSize: 24, marginBottom: 8 }}>🔍</div>
                                  {techSearch ? `No failures match "${techSearch}".` : 'No failure history available.'}
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    )
                  })()}

                  {/* ── Parts Inventory Tab ── */}
                  {techTab === "inventory" && (() => {
                    const allParts = [
                      ...lowStockData.map(p => ({ ...p, _category: 'Critical' })),
                      ...reorderSoonData.map(p => ({ ...p, _category: 'Reorder' })),
                      ...sufficientStockData.map(p => ({ ...p, _category: 'Sufficient' })),
                    ]
                    const filtered = allParts.filter(p =>
                      Object.values(p).some(v => String(v).toLowerCase().includes(techSearch.toLowerCase()))
                    )
                    const partHeaders = allParts.length > 0
                      ? ['_category', ...Object.keys(allParts[0]).filter(k => !['id', 'created_at', 'updated_at', '_category', 'part_name', 'risk_score', 'processed_at', 'part_cost', 'reason', 'warranty'].includes(k))]
                      : []

                    const categoryColor: Record<string, string> = {
                      Critical: '#ef4444',
                      Reorder: '#f97316',
                      Sufficient: '#10b981',
                    }

                    return (
                      <div className="agent-table-wrapper">
                        <table className="agent-table">
                          <thead>
                            <tr>
                              {partHeaders.map(h => (
                                <th key={h}>{(h === '_category' ? 'STATUS' : h.replace(/_/g, ' ')).toUpperCase()}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {filtered.length > 0 ? filtered.map((p, idx) => (
                              <tr key={p.part_id || idx}>
                                {partHeaders.map(h => {
                                  if (h === '_category') {
                                    return (
                                      <td key={h}>
                                        <span style={{
                                          padding: '3px 10px', borderRadius: 999, fontSize: 11, fontWeight: 700,
                                          background: (categoryColor[p._category] || '#94a3b8') + '18',
                                          color: categoryColor[p._category] || '#94a3b8', letterSpacing: 0.5
                                        }}>
                                          {p._category}
                                        </span>
                                      </td>
                                    )
                                  }
                                  return <td key={h}>{p[h]?.toString() || "—"}</td>
                                })}
                              </tr>
                            )) : (
                              <tr>
                                <td colSpan={partHeaders.length} style={{ textAlign: 'center', padding: 40, color: 'var(--grey-400)' }}>
                                  <div style={{ fontSize: 24, marginBottom: 8 }}>🔍</div>
                                  {techSearch ? `No parts match "${techSearch}".` : 'No inventory data available.'}
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    )
                  })()}
                </>
              )}
            </div>
          )}

        </div>{/* end page-content */}
      </main >

      {/* ── QR CODE MODAL ────────────────────────────────────── */}
      {
        selectedQRCode && (
          <div className="qr-modal-overlay" onClick={() => setSelectedQRCode(null)}>
            <div className="qr-modal" onClick={e => e.stopPropagation()}>
              <button className="qr-modal-close" onClick={() => setSelectedQRCode(null)}>✕</button>
              <div className="qr-title">Machine Identity QR</div>
              <div className="qr-subtitle">Scan to view machine health details on mobile</div>

              <div className="qr-image-wrap">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`}
                  alt="QR Code"
                  width={220}
                  height={220}
                />
              </div>

              <div className="qr-details-summary">
                <div className="qr-detail-row">
                  <span className="qr-detail-label">Machine ID</span>
                  <span className="qr-detail-value">{selectedQRCode.id}</span>
                </div>
                <div className="qr-detail-row">
                  <span className="qr-detail-label">Status</span>
                  <span className="qr-detail-value">{selectedQRCode.status}</span>
                </div>
                <div className="qr-detail-row">
                  <span className="qr-detail-label">Summary</span>
                  <span className="qr-detail-value">{selectedQRCode.summary}</span>
                </div>
                <a
                  href={mailtoLink}
                  className="agent-deep-dive-btn"
                  style={{
                    display: "block",
                    textAlign: "center",
                    marginTop: 16,
                    textDecoration: "none",
                    width: "100%"
                  }}
                >
                  Click Me to Send Email
                </a>
              </div>
            </div>
          </div>
        )
      }
    </div >
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

function SectionTable({ title, data, excludeKeys = [], renderActions }: { title: string; data: any[]; excludeKeys?: string[]; renderActions?: (item: any) => React.ReactNode }) {
  const [search, setSearch] = useState("");

  if (!data || data.length === 0) {
    return (
      <div className="section-table-box">
        <div className="section-header" style={{ marginTop: 40, marginBottom: 12 }}>
          <div className="section-title">{title}</div>
        </div>
        <div className="agent-table-wrapper">
          <table className="agent-table">
            <tbody>
              <tr>
                <td style={{ textAlign: "center", padding: 40, color: "var(--grey-400)" }}>
                  <div style={{ fontSize: 24, marginBottom: 8 }}>📦</div>
                  No data available for {title}.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  // Get table headers from object keys (excluding technical fields)
  const headers = Object.keys(data[0]).filter(k =>
    !['id', 'created_at', 'updated_at', ...excludeKeys.map(ek => ek.toLowerCase())].includes(k.toLowerCase())
  )

  const filtered = data.filter(item =>
    Object.values(item).some(val =>
      String(val).toLowerCase().includes(search.toLowerCase())
    )
  );

  return (
    <div className="section-table-box">
      <div className="section-header" style={{ marginTop: 40, marginBottom: 12 }}>
        <div className="section-title">{title}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {search && (
            <span style={{ fontSize: 12, color: "var(--grey-400)", fontWeight: 600 }}>
              {filtered.length} results
            </span>
          )}
          <div className="search-wrapper" style={{ width: 280 }}>
            <span className="search-icon">{icons.search}</span>
            <input
              type="text"
              placeholder="Search in table…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="search-input"
            />
          </div>
        </div>
      </div>
      <div className="agent-table-wrapper">
        <table className="agent-table">
          <thead>
            <tr>
              {headers.map(h => (
                <th key={h}>{h.replace(/_/g, ' ').toUpperCase()}</th>
              ))}
              {renderActions && <th>TAKE ACTION</th>}
            </tr>
          </thead>
          <tbody>
            {filtered.length > 0 ? (
              filtered.map((item, idx) => (
                <tr key={item.id || idx}>
                  {headers.map(h => (
                    <td key={h}>{item[h]?.toString() || "—"}</td>
                  ))}
                  {renderActions && (
                    <td>
                      {renderActions(item)}
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={headers.length + (renderActions ? 1 : 0)} style={{ textAlign: "center", padding: 40, color: "var(--grey-400)" }}>
                  <div style={{ fontSize: 24, marginBottom: 8 }}>🔍</div>
                  No results found for "{search}".
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}


import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET() {

  /* ======================================================
     1️⃣ WARRANTY DISTRIBUTION (Dynamic Calculation)
  ====================================================== */

  const { data: machines, error: machineError } = await supabase
    .from("machines")
    .select("install_date, expected_life_years")

  if (machineError) {
    return NextResponse.json({ error: machineError.message }, { status: 500 })
  }

  const today = new Date()

  let inWarranty = 0
  let expired = 0
  let aboutToExpire = 0

  machines?.forEach(machine => {

    if (!machine.install_date || !machine.expected_life_years) return

    const installDate = new Date(machine.install_date)

    const expiryDate = new Date(installDate)
    expiryDate.setFullYear(
      expiryDate.getFullYear() + machine.expected_life_years
    )

    const diffTime = expiryDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays < 0) {
      expired++
    } else if (diffDays < 180) {
      aboutToExpire++
    } else {
      inWarranty++
    }
  })

  // 2️⃣ FAILURE DATA
  const { data: failures } = await supabase
    .from("failure_history")
    .select("machine_id, failure_date")

  // Top 5 failure machines
  const machineMap: any = {}

  failures?.forEach(f => {
    machineMap[f.machine_id] = (machineMap[f.machine_id] || 0) + 1
  })

  const topFailures = Object.entries(machineMap)
    .map(([machine_id, count]) => ({
      machine_id,
      count
    }))
    .sort((a: any, b: any) => b.count - a.count)

  // Monthly trend
  const monthlyMap: any = {}

  failures?.forEach(f => {
    const month = new Date(f.failure_date).toLocaleString("default", { month: "short" })
    monthlyMap[month] = (monthlyMap[month] || 0) + 1
  })

  const monthlyTrend = Object.entries(monthlyMap).map(([month, count]) => ({
    month,
    count
  }))

  return NextResponse.json({
    warrantyDistribution: [
      { name: "In Warranty", value: inWarranty },
      { name: "About to Expire", value: aboutToExpire },
      { name: "Expired", value: expired }
    ],
    topFailures,
    monthlyTrend
  })
}
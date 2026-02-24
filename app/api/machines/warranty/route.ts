import { supabase } from "@/lib/supabase"
import { NextResponse } from "next/server"

export async function GET() {

  const { data, error } = await supabase
    .from("machines")
    .select("machine_id, machine_name, install_date, expected_life_years")

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const today = new Date()

  const machinesWithWarranty = data?.map((machine) => {

    const installDate = new Date(machine.install_date)
    const expiryDate = new Date(installDate)
    expiryDate.setFullYear(
      expiryDate.getFullYear() + machine.expected_life_years
    )

    const diffTime = expiryDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    let status = "In Warranty"

    if (diffDays < 0) {
      status = "Expired"
    } else if (diffDays < 180) {
      status = "About to Expire"
    }

    return {
      machine_id: machine.machine_id,
      machine_name: machine.machine_name,
      expiry_date: expiryDate,
      remaining_days: diffDays,
      status
    }
  })

  return NextResponse.json(machinesWithWarranty)
}

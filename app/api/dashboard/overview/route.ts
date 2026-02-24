import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // 1️⃣ Machines count
    const { count: machinesCount, error: machinesError } = await supabase
      .from('machines')
      .select('*', { count: 'exact', head: true })

    if (machinesError) throw machinesError

    // 2️⃣ Failures (Incidents)
    const { data: failures, error: failureError } = await supabase
      .from('failure_history')
      .select('failure_date, downtime_hours, total_loss')

    if (failureError) throw failureError

    const incidentsCount = failures?.length || 0

    // 3️⃣ Total Downtime
    const totalDowntime =
      failures?.reduce((sum, f) => sum + (f.downtime_hours || 0), 0) || 0

    // 4️⃣ Earnings Impact
    // const earningsImpact =
    //   failures?.reduce((sum, f) => sum + (f.total_loss || 0), 0) || 0
    const { data: lossData } = await supabase
      .from('failure_history')
      .select('total_loss', { count: 'exact' })

    const earningsImpact =
      lossData?.reduce((sum, f) => sum + (f.total_loss || 0), 0) || 0






    // 5️⃣ MTTR (Mean Time To Repair)
    const mttr =
      incidentsCount > 0
        ? totalDowntime / incidentsCount
        : 0

    // 6️⃣ MTBF (Mean Time Between Failures)
    let mtbf = 0

    console.log("Total Loss:", earningsImpact)


    if (failures && failures.length > 0 && machinesCount) {
      const earliestDate = new Date(
        Math.min(...failures.map(f => new Date(f.failure_date).getTime()))
      )

      const now = new Date()
      const totalHours =
        (now.getTime() - earliestDate.getTime()) / (1000 * 60 * 60)

      mtbf =
        incidentsCount > 0
          ? totalHours / incidentsCount
          : 0
    }

    // 7️⃣ Availability %
    const availability =
      mtbf + mttr > 0
        ? (mtbf / (mtbf + mttr)) * 100
        : 0

    return NextResponse.json({
      machines: machinesCount ?? 0,
      incidents: incidentsCount,
      totalDowntime: Number(totalDowntime.toFixed(2)),
      earningsImpact: Number(earningsImpact.toFixed(2)),
      mttr: Number(mttr.toFixed(2)),
      mtbf: Number(mtbf.toFixed(2)),
      availability: Number(availability.toFixed(2))
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}


import { NextResponse } from "next/server"
import { scrapeCoesExcel } from "@/lib/scrapers/coesScraper"

export async function POST() {
  const result = await scrapeCoesExcel()
  return NextResponse.json(result, { status: result.ok ? 200 : 500 })
}

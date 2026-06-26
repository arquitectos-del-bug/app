import { NextResponse } from "next/server"

export async function GET() {
  // Retornar directamente datos de caudal históricos y actuales sin consultar Supabase
  const flows = [
    { name: "24/06", value: 295, color: "#3b82f6", isDashed: false },
    { name: "25/06", value: 310, color: "#3b82f6", isDashed: false },
    { name: "Hoy", value: 312, color: "#3b82f6", isDashed: false },
    { name: "Pico 2017", value: 489, color: "#ef4444", isDashed: true },
    { name: "Pico 2023", value: 401, color: "#f59e0b", isDashed: true },
  ]
  
  return NextResponse.json({ flows })
}


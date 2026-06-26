import { NextResponse } from "next/server"
import OpenAI from "openai"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      score,
      nivel,
      distrito,
      lluviaMm,
      ptsCauce,
      ptsLluvia,
      ptsVuln,
      cauceCercano,
      distanciaMetros
    } = body

    if (
      score === undefined ||
      !nivel ||
      !distrito ||
      lluviaMm === undefined ||
      ptsCauce === undefined ||
      ptsLluvia === undefined ||
      ptsVuln === undefined
    ) {
      return NextResponse.json({ error: "Faltan parámetros requeridos en el body" }, { status: 400 })
    }

    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) throw new Error("OPENAI_API_KEY no configurada")

    const openai = new OpenAI({ apiKey })

    const cleanDistrito = distrito.split(',')[0].trim()
    const caucaInfo = cauceCercano && distanciaMetros
      ? `La quebrada/cauce más cercano es "${cauceCercano}" a ${distanciaMetros} metros.`
      : "No hay cauce identificado cerca."

    const prompt = `Eres un sistema de alerta temprana de huaicos e inundaciones para el Perú.

Datos del usuario:
- Distrito: ${cleanDistrito}
- Score de riesgo: ${score}/100
- Nivel: ${nivel}
- Lluvia pronosticada 48h (Open-Meteo): ${lluviaMm} mm
- Puntos por cercanía a cauce: ${ptsCauce}/40
- Puntos por lluvia: ${ptsLluvia}/40
- Puntos por alerta SENAMHI activa: ${ptsVuln}/20
- ${caucaInfo}

Genera exactamente 3 recomendaciones de autoprotección personalizadas. Cada una debe:
1. Usar los datos numéricos reales (menciona los mm de lluvia, los metros a la quebrada, el distrito)
2. Ser accionable y específica, no genérica
3. Adaptarse al nivel de riesgo (${nivel})

Responde SOLO con JSON válido, sin markdown, con este formato exacto:
[
  {"id": 1, "icon": "emoji", "title": "Título corto", "description": "Descripción específica con datos reales"},
  {"id": 2, "icon": "emoji", "title": "Título corto", "description": "Descripción específica con datos reales"},
  {"id": 3, "icon": "emoji", "title": "Título corto", "description": "Descripción específica con datos reales"}
]`

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 500,
      temperature: 0.3,
    })

    const content = completion.choices[0]?.message?.content?.trim()
    if (!content) throw new Error("Respuesta vacía de OpenAI")

    const steps = JSON.parse(content)
    return NextResponse.json({ steps })

  } catch (error: any) {
    console.error("Error en API de recomendaciones:", error)

    // Fallback local si OpenAI falla
    const body = await request.json().catch(() => ({}))
    const { nivel = "MODERADO", distrito = "", lluviaMm = 0, ptsCauce = 0, cauceCercano, distanciaMetros } = body
    const cleanDistrito = (distrito as string).split(',')[0].trim() || "tu zona"
    const steps = []

    if (nivel === "ALTO") {
      steps.push({ id: 1, icon: "🎒", title: "Mochila y documentos", description: "Toma tu mochila de emergencia ya. Pon botellas de agua, radio a pilas y documentos en bolsa hermética." })
    } else {
      steps.push({ id: 1, icon: "🎒", title: "Mochila a la mano", description: `Ten tu mochila lista cerca de la salida principal en ${cleanDistrito} con linternas y botiquín.` })
    }

    if (ptsCauce > 15 && cauceCercano && distanciaMetros) {
      steps.push({ id: 2, icon: "🚶", title: "Punto seguro de evacuación", description: `Tu casa está a solo ${distanciaMetros}m de ${cauceCercano}. Sube de inmediato a zonas altas seguras.` })
    } else {
      steps.push({ id: 2, icon: "🚶", title: "Vías de evacuación", description: "Reconoce los puntos de reunión y zonas seguras asignadas por Defensa Civil de tu municipalidad." })
    }

    if (lluviaMm > 15) {
      steps.push({ id: 3, icon: "🌧️", title: "Limpieza de techos y canaletas", description: `Se pronostican ${lluviaMm}mm de lluvia en ${cleanDistrito}. Limpia drenajes para evitar inundaciones.` })
    } else {
      steps.push({ id: 3, icon: "📞", title: "Reportes oficiales", description: "Monitorea las cuentas de SENAMHI e INDECI para seguir el comportamiento de la cuenca Rímac." })
    }

    return NextResponse.json({ steps, fallback: true })
  }
}

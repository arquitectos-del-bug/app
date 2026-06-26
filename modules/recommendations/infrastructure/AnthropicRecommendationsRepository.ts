import { Anthropic } from "@anthropic-ai/sdk"
import { EvacuationStep } from "../domain/EvacuationPlan"
import { RecommendationsRepository, RecommendationsRepositoryInput } from "../domain/RecommendationsRepository"

export function createAnthropicRecommendationsRepository(): RecommendationsRepository {
  return {
    getRecommendations: async (input: RecommendationsRepositoryInput): Promise<EvacuationStep[]> => {
      const {
        score,
        nivel,
        distrito,
        lluviaMm,
        ptsCauce,
        ptsLluvia,
        ptsVuln,
        caudal,
        caudal2017,
        caudal2023,
        alertaCOEN,
      } = input

      // Fallbacks según el nivel de riesgo
      const getFallbackRecommendations = (lvl: string): EvacuationStep[] => {
        const uppercaseLvl = lvl.toUpperCase()
        if (uppercaseLvl === "ALTO") {
          return [
            {
              id: 1,
              icon: "🎒",
              title: "Mochila y documentos",
              description: "Toma tu mochila de emergencia con agua, comida y documentos protegidos en bolsa hermética.",
            },
            {
              id: 2,
              icon: "🚶",
              title: "Evacuación inmediata",
              description: "Sube a zonas altas seguras ahora mismo. No cruces quebradas activas ni puentes inestables.",
            },
            {
              id: 3,
              icon: "📞",
              title: "Números de emergencia",
              description: "Llama al 119 (INDECI) si necesitas rescate. Comunícate y ayuda a tus vecinos vulnerables.",
            },
          ]
        } else if (uppercaseLvl === "MODERADO") {
          return [
            {
              id: 1,
              icon: "🎒",
              title: "Mochila a la mano",
              description: "Coloca tu mochila de emergencia cerca de la salida. Revisa botiquín y linternas.",
            },
            {
              id: 2,
              icon: "🚶",
              title: "Rutas listas",
              description: "Identifica las vías de evacuación hacia zonas altas. Evita acercarte a cauces secos.",
            },
            {
              id: 3,
              icon: "📞",
              title: "Alerta comunitaria",
              description: "Mantente alerta a los silbatos vecinales y noticias locales. Limpia canaletas en tu techo.",
            },
          ]
        } else {
          return [
            {
              id: 1,
              icon: "🎒",
              title: "Prepara la mochila",
              description: "Reúne elementos básicos para tu mochila de emergencia: linterna, agua y alimentos enlatados.",
            },
            {
              id: 2,
              icon: "🚶",
              title: "Ubica zonas seguras",
              description: "Conoce los puntos de reunión designados por Defensa Civil en tu distrito.",
            },
            {
              id: 3,
              icon: "📞",
              title: "Mantente informado",
              description: "Monitorea reportes oficiales de SENAMHI sobre pronósticos de lluvias en las cuencas.",
            },
          ]
        }
      }

      const apiKey = process.env.ANTHROPIC_API_KEY
      if (!apiKey) {
        console.warn("No se encontró ANTHROPIC_API_KEY. Usando recomendaciones estáticas de resiliencia.")
        return getFallbackRecommendations(nivel)
      }

      try {
        const anthropic = new Anthropic({ apiKey })
        const model = process.env.ANTHROPIC_MODEL || "claude-3-5-haiku-20241022"

        const systemPrompt = `Eres un asistente de Defensa Civil del Perú especializado en huaicos y desbordes.
Tu tarea es dar recomendaciones de evacuación CONCRETAS, breves y en español peruano coloquial pero claro. Habla de "tú". No inventes datos: usa solo el contexto entregado.
Prioriza la vida: mochila de emergencia, rutas a zonas altas/seguras y evitar quebradas y cauces. Si el riesgo es alto, transmite urgencia sin causar pánico.`

        const userPrompt = `Contexto del ciudadano:
- Distrito: ${distrito}
- Nivel de riesgo: ${nivel} (${score}/100)
- Desglose: cercanía a cauce ${ptsCauce}/40, lluvia 48h ${ptsLluvia}/40, vulnerabilidad ${ptsVuln}/20
- Lluvia pronosticada próximas 48h: ${lluviaMm} mm
- Caudal del río Rímac: ${caudal} m³/s (histórico marzo 2017: ${caudal2017}, 2023: ${caudal2023})
- Alerta oficial activa: ${alertaCOEN}

Genera EXACTAMENTE 3 viñetas de acción, cada una de máximo 20 palabras, priorizadas por urgencia. No agregues introducción ni cierre.`

        const msg = await anthropic.messages.create({
          model: model,
          max_tokens: 300,
          temperature: 0.4,
          system: systemPrompt,
          messages: [{ role: "user", content: userPrompt }],
        })

        const textContent = msg.content[0]?.type === "text" ? msg.content[0].text : ""
        if (!textContent) {
          throw new Error("Respuesta vacía de Claude")
        }

        // Parsear viñetas
        const lines = textContent
          .split("\n")
          .map((line) => line.trim())
          .filter((line) => line.startsWith("•") || line.startsWith("-") || line.startsWith("*") || /^\d+\./.test(line) || line.length > 5)
          .map((line) => line.replace(/^[•\-*\d\.\s]+/, "")) // Remover viñetas iniciales
          .slice(0, 3)

        if (lines.length < 3) {
          throw new Error("No se generaron las 3 recomendaciones esperadas")
        }

        const icons = ["🎒", "🚶", "📞"]
        const titles = [
          nivel.toUpperCase() === "ALTO" ? "Mochila y documentos" : "Prepara tu mochila",
          nivel.toUpperCase() === "ALTO" ? "Evacuación inmediata" : "Ruta de evacuación",
          nivel.toUpperCase() === "ALTO" ? "Reporta y coordina" : "Mantente informado",
        ]

        return lines.map((desc, index) => ({
          id: index + 1,
          icon: icons[index] || "🎒",
          title: titles[index] || "Recomendación",
          description: desc,
        }))
      } catch (error) {
        console.error("Error al consultar Claude. Usando fallback de resiliencia:", error)
        return getFallbackRecommendations(nivel)
      }
    },
  }
}

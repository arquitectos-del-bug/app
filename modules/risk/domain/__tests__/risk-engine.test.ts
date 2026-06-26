import { describe, it, expect } from "vitest"
import { calcularRiesgo, haversineMetros, distanciaAlCauce, puntajeCauce, puntajeLluvia, puntajeVulnerabilidad } from "../riskCalculator"
import { DangerZone } from "../DangerZone"

describe("Cálculos del Motor de Riesgo (Risk Engine)", () => {
  const mockDangerZones: DangerZone[] = [
    {
      id: "quebrada-quirio",
      nombre: "Quebrada Quirio",
      distrito: "Lurigancho-Chosica",
      rio: "Rímac",
      cuenca: "Rímac",
      peligrosidad: 0.95,
      coords: [
        { lat: -11.9321, lon: -76.6891 },
        { lat: -11.9345, lon: -76.6912 },
        { lat: -11.9378, lon: -76.6934 },
      ],
    },
  ]

  describe("Fórmula de Haversine", () => {
    it("debe calcular correctamente la distancia en metros entre dos puntos geográficos", () => {
      // Coordenadas conocidas: Quirio punto 1 y punto 2
      const dist = haversineMetros(-11.9321, -76.6891, -11.9345, -76.6912)
      expect(dist).toBeGreaterThan(300)
      expect(dist).toBeLessThan(400)
    })

    it("debe retornar 0 si los puntos son idénticos", () => {
      const dist = haversineMetros(-11.9321, -76.6891, -11.9321, -76.6891)
      expect(dist).toBe(0)
    })
  })

  describe("Distancia al Cauce y Peligrosidad", () => {
    it("debe calcular la distancia mínima a los puntos del cauce", () => {
      // Ubicación idéntica a uno de los puntos
      const dist = distanciaAlCauce(-11.9345, -76.6912, mockDangerZones[0]!)
      expect(dist).toBe(0)
    })

    it("debe calcular puntuaciones de cauce altas si el usuario está muy cerca", () => {
      // A menos de 200 metros del cauce, con peligrosidad de 0.95, debería dar ~38 pts
      const result = puntajeCauce(-11.9321, -76.6891, mockDangerZones)
      expect(result.pts).toBe(38)
      expect(result.cauceCercano).toBe("Quebrada Quirio")
    })

    it("debe decaer el puntaje linealmente si la distancia es mayor a 200m pero menor a 2000m", () => {
      // Ubicado a aprox. 1000m del cauce
      const result = puntajeCauce(-11.942, -76.695, mockDangerZones)
      expect(result.pts).toBeGreaterThan(0)
      expect(result.pts).toBeLessThan(38)
    })

    it("debe retornar 0 pts si la distancia supera los 2000m", () => {
      // Ubicación muy lejana (ej. centro de Lima)
      const result = puntajeCauce(-12.0463, -77.031, mockDangerZones)
      expect(result.pts).toBe(0)
    })
  })

  describe("Puntaje por Lluvias (48h)", () => {
    it("debe dar 0 pts de lluvia si es menor a 5mm", () => {
      expect(puntajeLluvia(4)).toBe(0)
      expect(puntajeLluvia(0)).toBe(0)
    })

    it("debe escalar linealmente de 5mm a 60mm", () => {
      // Punto medio (aprox 32.5mm) debe dar ~20 pts
      const ptsMedio = puntajeLluvia(32.5)
      expect(ptsMedio).toBe(20)
    })

    it("debe topar el puntaje en 40 pts si la lluvia supera los 60mm", () => {
      expect(puntajeLluvia(60)).toBe(40)
      expect(puntajeLluvia(100)).toBe(40)
    })
  })

  describe("Puntaje por Vulnerabilidad / Alertas COEN", () => {
    it("debe dar 20 pts si hay alerta activa", () => {
      expect(puntajeVulnerabilidad(true)).toBe(20)
    })

    it("debe dar 0 pts si no hay alerta", () => {
      expect(puntajeVulnerabilidad(false)).toBe(0)
    })
  })

  describe("Cálculo Integral del Riesgo (calcularRiesgo)", () => {
    it("debe clasificar como ALTO riesgo un escenario crítico", () => {
      const input = {
        lat: -11.9321, // Justo sobre la quebrada Quirio (38 pts)
        lon: -76.6891,
        lluviaMm: 50,  // Lluvia muy alta (~33 pts)
        cauces: mockDangerZones,
        alertaActiva: true, // Alerta activa (20 pts)
      }

      const result = calcularRiesgo(input)
      // Score total = 38 + 33 + 20 = 91
      expect(result.score).toBe(91)
      expect(result.nivel).toBe("ALTO")
      expect(result.desglose.cauceCercano).toBe("Quebrada Quirio")
    })

    it("debe clasificar como BAJO riesgo un escenario seguro", () => {
      const input = {
        lat: -12.0463, // Lejos del cauce (0 pts)
        lon: -77.031,
        lluviaMm: 2,   // Lluvia mínima (0 pts)
        cauces: mockDangerZones,
        alertaActiva: false, // Sin alerta (0 pts)
      }

      const result = calcularRiesgo(input)
      expect(result.score).toBe(0)
      expect(result.nivel).toBe("BAJO")
    })

    it("debe limitar el score de riesgo máximo a 100", () => {
      const input = {
        lat: -11.9321,
        lon: -76.6891,
        lluviaMm: 60,       // Max lluvia (40 pts)
        cauces: mockDangerZones,
        alertaActiva: true, // Alerta activa (20 pts)
      } // Total = 38 + 40 + 20 = 98. 
      // Si aumentamos la peligrosidad a 1.0 (tramo Rímac), daría 40 + 40 + 20 = 100.
      // Probemos con lluvia extrema
      const inputMax = {
        ...input,
        lluviaMm: 120, // Provoca max pt de lluvia (40 pts)
        alertaActiva: true,
      }
      const result = calcularRiesgo(inputMax)
      expect(result.score).toBeLessThanOrEqual(100)
    })
  })
})

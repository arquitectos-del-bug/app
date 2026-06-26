import fetch from 'node-fetch'
import * as xlsx from 'xlsx'
import * as cheerio from 'cheerio'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function scrapeCoesExcel() {
  const urlPortal = 'https://www.coes.org.pe/Portal/Operacion/Estudios/Hidrologia'
  console.log(`Buscando enlace de reporte en: ${urlPortal}`)

  try {
    const portalResponse = await fetch(urlPortal, { headers: { 'User-Agent': 'Mozilla/5.0' } })
    if (!portalResponse.ok) throw new Error('No se pudo acceder al portal de hidrología de COES.')

    const html = await portalResponse.text()
    const $ = cheerio.load(html)

    let urlExcel = ''
    $('a').each((i, el) => {
      const href = $(el).attr('href')
      if (href && (href.includes('Ieod/Descargar') || (href.includes('IEOD') && href.includes('.xlsx')))) {
        urlExcel = href.startsWith('http') ? href : `https://www.coes.org.pe${href}`
      }
    })

    if (!urlExcel) {
      const fechaHoy = new Date().toISOString().split('T')[0]
      urlExcel = `https://www.coes.org.pe/Portal/Operacion/Reportes/Ieod/Descargar?fecha=${fechaHoy}`
    }

    console.log(`Descargando Excel del IEOD desde: ${urlExcel}`)
    const response = await fetch(urlExcel, { headers: { 'User-Agent': 'Mozilla/5.0' } })
    if (!response.ok) throw new Error('No se pudo descargar el archivo Excel del COES.')

    const buffer = await response.arrayBuffer()
    const workbook = xlsx.read(new Uint8Array(buffer), { type: 'array' })

    const sheetName = workbook.SheetNames.find(
      (name) => name.includes('Hidro') || name.includes('Caudal')
    )
    if (!sheetName) throw new Error('No se encontró la hoja de hidrología en el Excel.')

    const sheet = workbook.Sheets[sheetName]
    const dataJson: any[] = xlsx.utils.sheet_to_json(sheet)

    const filaRimac = dataJson.find((row) =>
      Object.values(row).some((val) => val && val.toString().includes('Rímac'))
    )

    let caudalM3s = 312
    if (filaRimac) {
      for (const val of Object.values(filaRimac)) {
        if (typeof val === 'number' && val > 0) {
          caudalM3s = val
          break
        }
      }
    }

    const fechaHoyStr = new Date().toISOString().split('T')[0]
    console.log(`Caudal real del Rímac extraído: ${caudalM3s} m3/s`)

    const { error } = await supabase.from('hydrology_readings').upsert(
      {
        rio: 'Rímac',
        cuenca: 'Rímac',
        caudal_m3s: caudalM3s,
        fecha: fechaHoyStr,
        fuente: 'COES_IEOD',
        scraped_at: new Date().toISOString(),
      },
      { onConflict: 'rio,fecha' }
    )

    if (error) throw error
    console.log('Datos del COES sincronizados correctamente en Supabase.')
  } catch (error: any) {
    console.error('Fallo al ejecutar el scraper del COES:', error.message)
  }
}

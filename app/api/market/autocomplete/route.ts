import { NextRequest, NextResponse } from 'next/server'
import * as cheerio from 'cheerio'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const q = searchParams.get('q')

  if (!q || q.length < 2) {
    return NextResponse.json([])
  }

  try {
    // 1. Try Nominatim (Fast & Geocoded)
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&addressdetails=1&limit=5`
    try {
      const res = await fetch(url, { 
        headers: { 'User-Agent': 'PowerBILite/1.1' },
        next: { revalidate: 3600 } 
      })
      const data = await res.json()
      
      if (data && data.length > 0) {
        const suggestions = data
          .filter((item: any) => !['highway', 'boundary', 'place'].includes(item.class))
          .map((item: any) => {
            const addr = item.address
            return {
              id: `nom-${item.place_id}`,
              name: item.display_name.split(',')[0],
              location: [addr.city || addr.town || addr.suburb, addr.country].filter(Boolean).join(', '),
              lat: item.lat,
              lon: item.lon,
              type: addr.amenity || addr.shop || addr.office || 'Business'
            }
          })
        if (suggestions.length > 0) return NextResponse.json(suggestions)
      }
    } catch (e) {
      console.warn('Nominatim failed, falling back to Web Autocomplete')
    }

    // 2. Fallback to Web Search Autocomplete (DuckDuckGo - Very Resilient)
    const webUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(q + ' official website')}`
    const webRes = await fetch(webUrl, { 
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' } 
    })
    const html = await webRes.text()
    const $ = cheerio.load(html)
    
    const webSuggestions: any[] = []
    $('.result').slice(0, 5).each((i, el) => {
      const title = $(el).find('.result__title').text().trim()
      const snippet = $(el).find('.result__snippet').text().trim()
      const urlText = $(el).find('.result__url').text().trim()
      
      if (title) {
        webSuggestions.push({
          id: `web-${i}`,
          name: title.split('-')[0].split('|')[0].trim(),
          location: snippet.length > 10 ? (snippet.split('.')[0].substring(0, 50) + '...') : 'Found via Web',
          lat: 0,
          lon: 0,
          type: 'Business'
        })
      }
    })

    return NextResponse.json(webSuggestions)
  } catch (err) {
    return NextResponse.json([])
  }
}

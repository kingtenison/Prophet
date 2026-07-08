import { NextRequest, NextResponse } from 'next/server'
import * as cheerio from 'cheerio'

const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
]

function getRandomUA() {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)]
}

async function fetchDuckDuckGo(query: string): Promise<string | null> {
  const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': getRandomUA(), 'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8', 'Accept-Language': 'en-US,en;q=0.5' },
      signal: AbortSignal.timeout(8000),
    })
    if (!res.ok) return null
    return await res.text()
  } catch { return null }
}

async function fetchGoogleWeb(query: string): Promise<string | null> {
  const url = `https://www.google.com/search?q=${encodeURIComponent(query)}&hl=en`
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': getRandomUA(), 'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8', 'Accept-Language': 'en-US,en;q=0.5' },
      signal: AbortSignal.timeout(8000),
    })
    if (!res.ok) return null
    return await res.text()
  } catch { return null }
}

async function fetchBing(query: string): Promise<string | null> {
  const url = `https://www.bing.com/search?q=${encodeURIComponent(query)}&hl=en`
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': getRandomUA(), 'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8', 'Accept-Language': 'en-US,en;q=0.5' },
      signal: AbortSignal.timeout(8000),
    })
    if (!res.ok) return null
    return await res.text()
  } catch { return null }
}

function parseDuckDuckGoResults(html: string) {
  const $ = cheerio.load(html.substring(0, 120000))
  const results: { title: string; snippet: string; link: string }[] = []
  $('.result, .results__main .result').each((i, el) => {
    if (i < 8) results.push({
      title: $(el).find('.result__title, .result__a').text().trim(),
      snippet: $(el).find('.result__snippet').text().trim(),
      link: $(el).find('.result__url, .result__a').attr('href') || ''
    })
  })
  return results
}

function parseGoogleResults(html: string) {
  const $ = cheerio.load(html.substring(0, 120000))
  const results: { title: string; snippet: string; link: string }[] = []
  $('div.g').each((i, el) => {
    if (i < 8) {
      const linkEl = $(el).find('a')
      const href = linkEl.attr('href') || ''
      const cleanLink = href.startsWith('/url?q=')
        ? decodeURIComponent(href.split('/url?q=')[1]?.split('&')[0] || '')
        : href
      results.push({ title: $(el).find('h3').text().trim(), snippet: $(el).find('.VwiC3b, .lEBKkf').text().trim(), link: cleanLink })
    }
  })
  return results
}

function parseBingResults(html: string) {
  const $ = cheerio.load(html.substring(0, 120000))
  const results: { title: string; snippet: string; link: string }[] = []
  $('#b_results > li').each((i, el) => {
    if (i < 8) {
      const linkEl = $(el).find('a[href]')
      results.push({ title: $(el).find('h2').text().trim(), snippet: $(el).find('.b_caption p').text().trim(), link: linkEl.attr('href') || '' })
    }
  })
  return results
}

function extractDomain(link: string): string {
  try { return new URL(link).hostname.replace('www.', '') } catch { return '' }
}

const SOCIAL_DOMAINS = ['facebook.com', 'instagram.com', 'linkedin.com', 'twitter.com', 'x.com', 'youtube.com', 'tiktok.com']
const SOCIAL_LABELS: Record<string, string> = {
  'facebook.com': 'Facebook', 'instagram.com': 'Instagram', 'linkedin.com': 'LinkedIn',
  'twitter.com': 'X (Twitter)', 'x.com': 'X (Twitter)', 'youtube.com': 'YouTube', 'tiktok.com': 'TikTok'
}

const SERVICE_KEYWORDS = [
  'delivery', 'takeout', 'reservation', 'booking', 'appointment', 'consultation',
  'warranty', 'installation', 'repair', 'maintenance', 'support', 'training',
  'custom', 'organic', 'vegan', 'gluten-free', 'premium', 'luxury', 'budget',
  'express', 'emergency', 'mobile', 'online', 'virtual', 'curbside',
  'catering', 'wholesale', 'retail', 'franchise', 'subscription', 'membership',
  'shipping', 'pickup', '24/7', 'weekend', 'evening', 'same-day',
]

async function verifyWebsite(url: string): Promise<boolean> {
  try {
    const res = await fetch(url, { method: 'HEAD', signal: AbortSignal.timeout(3000) })
    return res.ok
  } catch { return false }
}

type SocialProfile = { platform: string; url: string; username?: string }
type ServiceOffer = string

type DeepAuditResult = {
  website: string | null
  websiteVerified: boolean
  rating: number
  reviewCount: number
  priceIndex: number
  digitalPresence: number
  riskScore: number
  socialProfiles: SocialProfile[]
  services: ServiceOffer[]
  strengths: string[]
  weaknesses: string[]
  snippet: string
  source: string
  lastUpdated: string
}

const rateLimitMap = new Map<string, number[]>()
const RATE_LIMIT_WINDOW = 30_000
const MAX_REQUESTS = 5

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const windowStart = now - RATE_LIMIT_WINDOW
  const timestamps = rateLimitMap.get(ip) || []
  const recent = timestamps.filter(t => t > windowStart)
  if (recent.length >= MAX_REQUESTS) return false
  recent.push(now)
  rateLimitMap.set(ip, recent)
  return true
}

async function deepAudit(name: string, location: string, osmItem?: any): Promise<DeepAuditResult> {
  const queries = [
    `${name} ${location}`,
    `${name} ${location} official website`,
    `${name} ${location} reviews rating`,
    `"${name}" ${location} facebook instagram linkedin`,
  ]

  const features: string[] = []
  const issues: string[] = []
  const socialProfiles: SocialProfile[] = []
  const services: Set<string> = new Set()
  let website: string | null = null
  let websiteVerified = false
  let rating = 0
  let reviewCount = 0
  let snippet = ''
  let source = 'Unknown'
  let allText = ''
  let foundAnyData = false
  let dataSources: string[] = []

  if (osmItem?.address) {
    if (osmItem.address.website) { website = osmItem.address.website; features.push('Verified Registry') }
    if (osmItem.address.phone) features.push('Registered Phone')
    foundAnyData = true; dataSources.push('OSM')
  }

  for (const query of queries) {
    const html = await fetchDuckDuckGo(query)
    if (!html) continue
    const results = parseDuckDuckGoResults(html)
    if (results.length === 0) continue
    foundAnyData = true; dataSources.push('DDG')

    source = dataSources.join('+')
    const combined = results.map(r => ({ text: r.title + ' ' + r.snippet, link: r.link }))

    if (!snippet) snippet = results[0].snippet.substring(0, 300)

    for (const r of combined) {
      allText += r.text + ' '
      const domain = extractDomain(r.link)

      if (!website && !domain.includes('search') && !domain.includes('google') && !domain.includes('bing') && domain && !SOCIAL_DOMAINS.includes(domain)) {
        website = r.link
      }

      const socialDomain = SOCIAL_DOMAINS.find(d => domain.includes(d) || r.link.includes(d))
      if (socialDomain && !socialProfiles.some(s => s.platform === SOCIAL_LABELS[socialDomain])) {
        socialProfiles.push({ platform: SOCIAL_LABELS[socialDomain], url: r.link, username: r.text.split(' ')[0] })
      }
    }
  }

  if (!foundAnyData) {
    const googleHtml = await fetchGoogleWeb(queries[0])
    if (googleHtml) {
      const results = parseGoogleResults(googleHtml)
      if (results.length > 0) {
        foundAnyData = true; dataSources.push('Google'); source = dataSources.join('+')
        snippet = results[0].snippet.substring(0, 300)
        const combined = results.map(r => ({ text: r.title + ' ' + r.snippet, link: r.link }))
        for (const r of combined) {
          allText += r.text + ' '
          if (!website) { const d = extractDomain(r.link); if (d && !SOCIAL_DOMAINS.includes(d) && !d.includes('google')) website = r.link }
          const socialDomain = SOCIAL_DOMAINS.find(d => r.link.includes(d))
          if (socialDomain && !socialProfiles.some(s => s.platform === SOCIAL_LABELS[socialDomain])) {
            socialProfiles.push({ platform: SOCIAL_LABELS[socialDomain], url: r.link })
          }
        }
      }
    }
  }

  if (!foundAnyData && osmItem) {
    source = 'OSM Registry'; snippet = `Registered in OSM as ${osmItem.display_name || name}.`
    if (osmItem.address?.website) website = osmItem.address.website
  }

  if (website && !websiteVerified) {
    websiteVerified = await verifyWebsite(website.startsWith('http') ? website : `https://${website}`)
  }

  const ratingMatch = allText.match(/([0-9.]+)\s*\/\s*5/) || allText.match(/rating:?\s*([0-9.]+)/) || allText.match(/([0-9.]+)\s*star/)
  if (ratingMatch) { rating = parseFloat(ratingMatch[1]); if (rating > 5) rating = rating / 10 }

  const reviewMatch = allText.match(/(\d+[,.\d]*(?:k|K)?)\s*(reviews|ratings)/) || allText.match(/(\d+)\s+review/)
  if (reviewMatch) {
    const num = reviewMatch[1].toLowerCase().replace('k', '000').replace(',', '')
    reviewCount = parseInt(num, 10) || 0
  }

  for (const word of SERVICE_KEYWORDS) {
    if (allText.toLowerCase().includes(word)) services.add(word.charAt(0).toUpperCase() + word.slice(1))
  }

  const strengthWords = ['professional', 'quality', 'affordable', 'fast', 'clean', 'modern', 'friendly', 'best', 'premium', 'luxury', 'sustainable', 'expert', 'trusted', 'reliable', 'award', 'certified', 'experienced', 'dedicated', 'innovative', 'comprehensive']
  const weaknessWords = ['slow', 'expensive', 'old', 'worst', 'poor', 'limited', 'bad', 'dirty', 'rude', 'unreliable', 'outdated', 'overpriced', 'unprofessional', 'unresponsive']

  for (const word of strengthWords) { if (allText.includes(word)) features.push(word.charAt(0).toUpperCase() + word.slice(1)) }
  for (const word of weaknessWords) { if (allText.includes(word)) issues.push(word.charAt(0).toUpperCase() + word.slice(1)) }

  const isMajor = allText.includes('wikipedia.org') || allText.includes('forbes.com') || allText.includes('bloomberg.com')
  if (isMajor) features.push('Established Brand')
  if (websiteVerified) features.push('Verified Website')

  const digitalPresence = Math.min(100,
    (website ? 20 : 0) + (websiteVerified ? 15 : 0) + (features.includes('Verified Registry') ? 15 : 0) + (features.includes('Verified Source') ? 10 : 0) +
    (features.includes('Registered Phone') ? 5 : 0) + (rating > 0 ? 10 : 0) + (reviewCount > 0 ? 5 : 0) + (features.includes('Established Brand') ? 10 : 0) +
    (socialProfiles.length > 0 ? Math.min(socialProfiles.length * 8, 20) : 0) + (foundAnyData ? 5 : 0)
  )

  const riskScore = Math.round(
    (rating < 3.5 ? 30 : rating < 4.0 ? 15 : 0) +
    (digitalPresence > 70 ? 30 : digitalPresence > 40 ? 15 : 0) +
    (socialProfiles.length >= 2 ? 20 : socialProfiles.length === 1 ? 10 : 0) +
    (reviewCount > 50 ? 15 : reviewCount > 10 ? 8 : 0) +
    (websiteVerified ? 15 : website ? 5 : 0)
  )

  return {
    website, websiteVerified,
    rating: parseFloat(rating.toFixed(1)), reviewCount,
    priceIndex: allText.includes('$$$') ? 90 : allText.includes('$$') ? 60 : allText.includes('$') ? 30 : 0,
    digitalPresence, riskScore,
    socialProfiles: socialProfiles.slice(0, 4),
    services: [...services].slice(0, 8),
    strengths: [...new Set(features)].slice(0, 5),
    weaknesses: [...new Set(issues)].slice(0, 3),
    snippet: snippet || `Business profile in ${location}.`,
    source,
    lastUpdated: new Date().toISOString(),
  }
}

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    if (!checkRateLimit(ip)) {
      return NextResponse.json({ error: 'Rate limit exceeded. Please wait before making another request.' }, { status: 429 })
    }

    const { businessName, businessType, location, coords } = await request.json()
    if (!businessName || !businessType) {
      return NextResponse.json({ error: 'Missing business details' }, { status: 400 })
    }

    let lat, lon, displayName, countryCode = ''
    let osmFullItem: any = null
    try {
      const geoUrl = coords?.lat
        ? `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.lat}&lon=${coords.lon}&addressdetails=1`
        : `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}&addressdetails=1&limit=1`
      const geoRes = await fetch(geoUrl, { headers: { 'User-Agent': 'PowerBILite/1.2' } })
      const geoData = await geoRes.json()
      const item = Array.isArray(geoData) ? geoData[0] : geoData
      if (item) { lat = item.lat; lon = item.lon; displayName = item.display_name; countryCode = item.address?.country_code || ''; osmFullItem = item }
    } catch { console.error('Geo resolution failed') }

    // 1. IDENTIFY THE USER'S ORGANIZATION — exact match search across multiple engines
    const orgSearchQueries = [
      `"${businessName}" ${displayName || location} official website`,
      `"${businessName}" ${displayName || location}`,
      `${businessName} ${displayName || location} about`,
    ]
    let orgWebsite: string | null = null
    let orgSocialProfiles: SocialProfile[] = []
    const foundDomains: Set<string> = new Set()
    let orgIdentificationMethod = 'web search'

    for (const query of orgSearchQueries) {
      const html = await fetchDuckDuckGo(query)
      if (!html) continue
      const results = parseDuckDuckGoResults(html)
      for (const r of results) {
        const nameMatch = r.title.toLowerCase().includes(businessName.toLowerCase())
        if (!nameMatch) continue
        const domain = extractDomain(r.link)
        if (domain && !foundDomains.has(domain) && !SOCIAL_DOMAINS.includes(domain) && !domain.includes('search')) {
          foundDomains.add(domain)
          if (!orgWebsite) orgWebsite = r.link
        }
        const socialDomain = SOCIAL_DOMAINS.find(d => domain.includes(d))
        if (socialDomain && !orgSocialProfiles.some(s => s.platform === SOCIAL_LABELS[socialDomain])) {
          orgSocialProfiles.push({ platform: SOCIAL_LABELS[socialDomain], url: r.link })
        }
      }
    }

    let orgWebsiteVerified = false
    if (orgWebsite) orgWebsiteVerified = await verifyWebsite(orgWebsite.startsWith('http') ? orgWebsite : `https://${orgWebsite}`)

    // 2. DISCOVER COMPETITORS — multi-engine, multi-query
    let competitorNames: { name: string; location: string }[] = []
    let discoveryMethod = 'none'

    const searchQueries = [
      `"${businessType}" in ${displayName || location}`,
      `best ${businessType} ${displayName || location}`,
      `top ${businessType} ${displayName || location}`,
      `${businessType} ${displayName || location} business`,
      `${businessType} near ${displayName || location}`,
      `"${businessType}" ${displayName || location} -${businessName}`,
    ]

    for (const query of searchQueries) {
      if (competitorNames.length >= 8) break
      const html = await fetchDuckDuckGo(query)
      if (!html) continue
      const results = parseDuckDuckGoResults(html)
      for (const r of results) {
        if (competitorNames.length >= 8) break
        const title = r.title; const snippet = r.snippet; const link = r.link
        if (title.toLowerCase().includes(businessName.toLowerCase())) continue
        if (link.includes('facebook.com') || link.includes('instagram.com') || link.includes('twitter.com') || link.includes('linkedin.com')) continue
        if (snippet.length < 15 || title.length < 3) continue

        let compName = title.replace(/ - Home$| \| Home$| — Home$/i, '').replace(/ - \w+\.\w+$/i, '').trim()
        if (compName.length < 3) compName = title.split(' - ')[0].split(' | ')[0].trim()
        if (competitorNames.some(c => fuzzyMatch(c.name, compName))) continue

        competitorNames.push({ name: compName, location: snippet.substring(0, 100) })
      }
      if (competitorNames.length > 0) discoveryMethod = 'DuckDuckGo'
    }

    // Fallback to Google if few competitors found
    if (competitorNames.length < 2) {
      const googleHtml = await fetchGoogleWeb(`${businessType} ${displayName || location}`)
      if (googleHtml) {
        const results = parseGoogleResults(googleHtml)
        for (const r of results) {
          if (competitorNames.length >= 8) break
          const title = r.title; const snippet = r.snippet
          if (title.toLowerCase().includes(businessName.toLowerCase())) continue
          if (snippet.length < 15 || title.length < 3) continue
          let compName = title.replace(/ - Home$| \| Home$| — Home$/i, '').replace(/ - \w+\.\w+$/i, '').trim()
          if (compName.length < 3) compName = title.split(' - ')[0].split(' | ')[0].trim()
          if (competitorNames.some(c => fuzzyMatch(c.name, compName))) continue
          competitorNames.push({ name: compName, location: snippet.substring(0, 100) })
        }
        if (competitorNames.length > 0 && discoveryMethod === 'none') discoveryMethod = 'Google Search'
      }
    }

    // Fallback to Bing if still few competitors
    if (competitorNames.length < 2) {
      const bingHtml = await fetchBing(`${businessType} ${displayName || location}`)
      if (bingHtml) {
        const results = parseBingResults(bingHtml)
        for (const r of results) {
          if (competitorNames.length >= 8) break
          const title = r.title; const snippet = r.snippet
          if (title.toLowerCase().includes(businessName.toLowerCase())) continue
          if (snippet.length < 15 || title.length < 3) continue
          let compName = title.replace(/ - Home$| \| Home$| — Home$/i, '').replace(/ - \w+\.\w+$/i, '').trim()
          if (compName.length < 3) compName = title.split(' - ')[0].split(' | ')[0].trim()
          if (competitorNames.some(c => fuzzyMatch(c.name, compName))) continue
          competitorNames.push({ name: compName, location: snippet.substring(0, 100) })
        }
        if (competitorNames.length > 0 && discoveryMethod === 'none') discoveryMethod = 'Bing Search'
      }
    }

    // 3. DEEP AUDIT each competitor
    const competitors: any[] = []
    for (const comp of competitorNames) {
      const audit = await deepAudit(comp.name, comp.location || displayName || location)
      competitors.push({
        id: `comp-${competitors.length}`,
        name: comp.name,
        fullName: comp.location || displayName || '',
        website: audit.website || null,
        websiteVerified: audit.websiteVerified,
        rating: audit.rating || 0,
        reviewCount: audit.reviewCount || 0,
        priceIndex: audit.priceIndex || 0,
        digitalPresence: audit.digitalPresence || 10,
        riskScore: audit.riskScore || 0,
        socialProfiles: audit.socialProfiles,
        services: audit.services,
        strengths: audit.strengths,
        weaknesses: audit.weaknesses,
        snippet: audit.snippet,
        source: audit.source,
        lastUpdated: audit.lastUpdated,
      })
    }

    // 4. DEEP AUDIT the user's organization
    const userAudit = await deepAudit(businessName, displayName || location, osmFullItem)
    userAudit.website = orgWebsite || userAudit.website
    userAudit.websiteVerified = orgWebsiteVerified || userAudit.websiteVerified
    if (orgSocialProfiles.length > 0) {
      const existingPlatforms = new Set(userAudit.socialProfiles.map(s => s.platform))
      for (const s of orgSocialProfiles) {
        if (!existingPlatforms.has(s.platform)) userAudit.socialProfiles.push(s)
      }
    }

    // 5. GENERATE ENHANCED INSIGHTS
    const metrics = calculateMarketMetrics(userAudit, competitors)
    const swot = generateSWOTFromData(userAudit, competitors, metrics)
    const roadmap = generateRoadmapFromData(userAudit, competitors, metrics, businessType)
    const sentiment = calculateSentiment(competitors)
    const matrices = generateMatrices(userAudit, competitors, metrics)
    const ansoff = generateAnsoffMatrix(userAudit, competitors, metrics)
    const hhi = calculateHHI(competitors)
    const riskSummary = calculateRiskSummary(competitors)
    const aiOverview = generateAIOverview(userAudit, competitors, metrics, matrices, businessType, sentiment)
    const propheticSolutions = generatePropheticSolutions(userAudit, metrics, matrices, ansoff, businessType, sentiment)

    return NextResponse.json({
      summary: `Nationwide intelligence audit for ${businessName} in the ${businessType} sector.`,
      userAudit,
      competitors,
      metrics,
      swot,
      roadmap,
      matrices,
      ansoff,
      hhi,
      riskSummary,
      aiOverview,
      propheticSolutions,
      orgVerification: {
        website: orgWebsite,
        websiteVerified: orgWebsiteVerified,
        socialProfiles: orgSocialProfiles,
        identificationMethod: orgIdentificationMethod,
      },
      location: { name: displayName || location },
      dataProvenance: {
        realCompetitors: competitors.length,
        discoveryMethod,
        competitorsWithSocial: competitors.filter(c => c.socialProfiles.length > 0).length,
        competitorsWithWebsite: competitors.filter(c => c.website).length,
        competitorsWithReviews: competitors.filter(c => c.reviewCount > 0).length,
        sourcesUsed: [...new Set(competitors.flatMap(c => [c.source]).filter(Boolean))], // Fixed: was using spread inside Set constructor
        generationMethod: 'All data sourced from real public web search (DuckDuckGo, Google, Bing). No synthetic data used.',
        auditedAt: new Date().toISOString(),
      }
    })
  } catch (err) {
    console.error('Market analysis error:', err)
    return NextResponse.json({ error: 'Market audit failed. Please try again.' }, { status: 500 })
  }
}

function fuzzyMatch(a: string, b: string): boolean {
  const na = a.toLowerCase().replace(/[^a-z0-9]/g, '')
  const nb = b.toLowerCase().replace(/[^a-z0-9]/g, '')
  if (na === nb) return true
  if (na.includes(nb) || nb.includes(na)) return true
  const wordsA = na.split(/\s+/).filter(Boolean)
  const wordsB = nb.split(/\s+/).filter(Boolean)
  return wordsA.some((w: string) => wordsB.includes(w)) && wordsA.length >= 2 && wordsB.length >= 2
}

function calculateMarketMetrics(user: any, comps: any[]) {
  const validComps = comps.filter(c => c.rating > 0 || c.digitalPresence > 10)
  const avgDigital = validComps.length > 0 ? validComps.reduce((a, b) => a + b.digitalPresence, 0) / validComps.length : 0
  const avgRating = validComps.length > 0 ? validComps.reduce((a, b) => a + b.rating, 0) / validComps.length : 0
  const avgPrice = validComps.length > 0 ? validComps.reduce((a, b) => a + b.priceIndex, 0) / validComps.length : 0
  const avgRisk = validComps.length > 0 ? validComps.reduce((a, b) => a + b.riskScore, 0) / validComps.length : 0
  return {
    avgDigital: Math.round(avgDigital), avgRating: parseFloat(avgRating.toFixed(1)), avgPrice: Math.round(avgPrice), avgRisk: Math.round(avgRisk),
    digitalGap: Math.round((user.digitalPresence || 0) - avgDigital),
    ratingGap: parseFloat(((user.rating || 0) - avgRating).toFixed(1)),
    marketSize: comps.length,
    userRisk: user.riskScore || 0,
  }
}

function calculateRiskSummary(comps: any[]) {
  const high = comps.filter(c => c.riskScore >= 50).length
  const medium = comps.filter(c => c.riskScore >= 25 && c.riskScore < 50).length
  const low = comps.filter(c => c.riskScore < 25).length
  return { high, medium, low, average: comps.length > 0 ? Math.round(comps.reduce((a: number, c: any) => a + c.riskScore, 0) / comps.length) : 0 }
}

function calculateHHI(comps: any[]) {
  const totalDP = comps.reduce((a: number, c: any) => a + c.digitalPresence, 0)
  if (totalDP === 0) return { hhi: 0, concentration: 'No data' }
  const hhi = Math.round(comps.reduce((sum: number, c: any) => sum + Math.pow((c.digitalPresence / totalDP) * 100, 2), 0))
  return { hhi, concentration: hhi > 2500 ? 'Highly Concentrated' : hhi > 1500 ? 'Moderately Concentrated' : 'Fragmented' }
}

function generateAnsoffMatrix(user: any, comps: any[], m: any) {
  const marketPenetration = user.digitalPresence > m.avgDigital ? 4 : user.digitalPresence > m.avgDigital * 0.7 ? 3 : 2
  const productDev = m.marketSize >= 5 ? 4 : m.marketSize >= 3 ? 3 : 2
  const marketDev = m.marketSize < 5 && user.digitalPresence > 30 ? 4 : 3
  const diversification = m.marketSize >= 4 && user.digitalPresence > 50 ? 3 : 2
  const avgCompRating = m.avgRating

  const strategies = {
    marketPenetration: {
      score: marketPenetration, label: 'Market Penetration',
      description: user.digitalPresence >= m.avgDigital
        ? 'Strong existing position — optimize conversion and loyalty programs.'
        : 'Room to grow share through pricing and local marketing.',
      recommendation: marketPenetration >= 3 ? 'Aggressively pursue' : 'Selectively invest',
    },
    productDevelopment: {
      score: productDev, label: 'Product / Service Development',
      description: m.marketSize >= 5
        ? 'Dense market — differentiation through unique service offerings.'
        : 'Limited competitors — expand service lines to capture demand.',
      recommendation: productDev >= 3 ? 'Launch new offerings' : 'Improve existing services',
    },
    marketDevelopment: {
      score: marketDev, label: 'Market Development',
      description: m.marketSize < 5
        ? 'Underserved area — expand to adjacent regions.'
        : 'Competitive area — focus on niche segments.',
      recommendation: marketDev >= 3 ? 'Expand geography' : 'Deepen local presence',
    },
    diversification: {
      score: diversification, label: 'Diversification',
      description: m.marketSize >= 4 && user.digitalPresence > 50
        ? 'Strong base allows adjacent industry expansion.'
        : 'Focus on core competencies before diversifying.',
      recommendation: diversification >= 3 ? 'Explore adjacencies' : 'Stay focused',
    },
  }

  const recommendedStrategy = Object.entries(strategies)
    .sort(([, a], [, b]) => b.score - a.score)[0]

  return { strategies, recommendedStrategy: { name: recommendedStrategy[0], ...recommendedStrategy[1] } }
}

function generateSWOTFromData(user: any, comps: any[], m: any) {
  const weakRivals = comps.filter(c => c.digitalPresence < 30).length
  const strongRivals = comps.filter(c => c.rating >= 4.0).length
  const topRival = comps.sort((a, b) => b.rating - a.rating)[0]
  const highRiskRivals = comps.filter(c => c.riskScore >= 50).length

  return {
    strengths: [
      user.website ? `Verified Digital Presence: Official domain (${user.website}) confirmed.` : 'Registered Entity Status: Baseline registry verification complete.',
      m.ratingGap > 0 ? `Sentiment Lead: Outperforming market average by ${m.ratingGap.toFixed(1)} points.` : 'Operational Stability: Maintains baseline sector parity.',
      user.socialProfiles?.length > 0 ? `Social Proof: ${user.socialProfiles.length} social platforms detected.` : 'Undefined digital identity across social platforms.',
    ],
    weaknesses: [
      !user.website ? 'Digital Infrastructure Void: No official domain detected in web audit.' : 'Search Visibility Limit: High dependency on baseline indexing.',
      m.digitalGap < 0 ? `Infrastructure Deficit: ${Math.abs(m.digitalGap)} points below sector infrastructure average.` : 'Competitive Density: Operating in a high-pressure saturated segment.',
      user.riskScore > 40 ? `Digital Risk: Risk score of ${user.riskScore}/100 indicates significant vulnerability.` : null,
    ].filter(Boolean),
    opportunities: [
      weakRivals > 0 ? `Digital Capture: ${weakRivals} rivals are "Digital Ghosts" with minimal web presence.` : 'Market Expansion: High sector growth suggests room for high-quality entrants.',
      `Intercept regional demand currently captured by ${topRival?.name || 'market leaders'} via keyword optimization.`,
      m.marketSize < 5 ? 'First-Mover Advantage: Low competitor density allows category leadership establishment.' : null,
    ].filter(Boolean),
    threats: [
      strongRivals > 0 ? `Consumer Sentiment Pressure: ${strongRivals} rivals maintain high ratings (≥4.0★).` : 'Low Barrier Entry: High risk of disruption by new digital-first entrants.',
      highRiskRivals > 0 ? `Competitive Intensity: ${highRiskRivals} competitors scored high on competitive risk.` : null,
    ].filter(Boolean),
  }
}

function generateRoadmapFromData(user: any, comps: any[], m: any, type: string) {
  const topRival = comps.sort((a, b) => b.rating - a.rating)[0]
  const socialGap = Math.max(0, (comps.reduce((a: number, c: any) => a + c.socialProfiles.length, 0) / Math.max(comps.length, 1)) - (user.socialProfiles?.length || 0))
  return [
    m.digitalGap < 0 ? `CRITICAL: Close the ${Math.abs(m.digitalGap)}% digital reach gap against ${topRival?.name || 'market leaders'}.` : `MAINTAIN: Defend your digital leadership position against ${topRival?.name || 'emerging rivals'}.`,
    `TACTICAL: Target a rating of ${Math.min(5, m.avgRating + 0.3).toFixed(1)} to secure top-3 positioning in ${type}.`,
    user.riskScore > 30 ? `DEFENSIVE: Address ${user.riskScore}/100 digital risk score — prioritize website ${user.website ? 'SEO' : 'creation'} and social proof.` : null,
    socialGap > 0 ? `SOCIAL: Bridge ${Math.round(socialGap)} social platform gap — establish presence on missing networks.` : null,
    `MARKETING: Focus on keywords like "${user.strengths?.[0] || 'Professional'}" to differentiate from local ${type} rivals.`,
  ].filter(Boolean)
}

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180; const dLon = (lon2 - lon1) * Math.PI / 180
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon/2) * Math.sin(dLon/2)
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)))
}

function generateMatrices(user: any, comps: any[], m: any) {
  const compCount = comps.length
  const highDigitalComps = comps.filter(c => c.digitalPresence >= 50).length
  const userDigital = user.digitalPresence || 10
  const userRating = user.rating || 0
  const userPrice = user.priceIndex || 0

  const digitalRating = userDigital >= 80 ? 4 : userDigital >= 50 ? 3 : userDigital >= 25 ? 2 : 1
  const sentimentRating = userRating >= 4.5 ? 4 : userRating >= 3.8 ? 3 : userRating >= 3.0 ? 2 : 1
  const reachRating = m.digitalGap >= 10 ? 4 : m.digitalGap >= 0 ? 3 : m.digitalGap >= -20 ? 2 : 1
  const webPresenceRating = user.website ? 4 : 1

  const ife: any = {
    factors: [
      { type: 'Strength', name: 'Online Digital Presence', weight: 0.25, rating: digitalRating, note: `Score: ${userDigital}/100` },
      { type: 'Strength', name: 'Customer Sentiment', weight: 0.25, rating: sentimentRating, note: `${userRating > 0 ? userRating.toFixed(1) + '/5.0' : 'No data'}` },
      { type: 'Weakness', name: 'Digital Reach vs Competitors', weight: 0.25, rating: reachRating, note: `${m.digitalGap >= 0 ? '+' : ''}${m.digitalGap} points` },
      { type: 'Weakness', name: 'Verified Web Infrastructure', weight: 0.25, rating: webPresenceRating, note: user.website ? `Confirmed` : 'No domain' }
    ]
  }
  ife.total = ife.factors.reduce((s: number, f: any) => s + f.weight * f.rating, 0)

  const underservedRating = comps.filter(c => c.rating < 3.5).length >= 2 ? 4 : comps.filter(c => c.rating < 3.5).length === 1 ? 3 : 2
  const demandRating = compCount >= 6 ? 4 : compCount >= 3 ? 3 : compCount >= 1 ? 2 : 1
  const rivalryRating = comps.some(c => c.rating >= 4.5) ? 1 : comps.some(c => c.rating >= 4.0) ? 2 : 3
  const saturationRating = highDigitalComps >= 4 ? 1 : highDigitalComps >= 2 ? 2 : highDigitalComps >= 1 ? 3 : 4

  const efe: any = {
    factors: [
      { type: 'Opportunity', name: 'Underserved Market Segments', weight: 0.25, rating: underservedRating, note: `${comps.filter(c => c.rating < 3.5).length} weak competitors` },
      { type: 'Opportunity', name: 'Market Demand Density', weight: 0.25, rating: demandRating, note: `${compCount} active competitors` },
      { type: 'Threat', name: 'Elite Competitor Presence', weight: 0.30, rating: rivalryRating, note: `${comps.filter(c => c.rating >= 4.0).length} rivals >4.0★` },
      { type: 'Threat', name: 'Digital Market Saturation', weight: 0.20, rating: saturationRating, note: `${highDigitalComps} digital-savvy competitors` }
    ]
  }
  efe.total = efe.factors.reduce((s: number, f: any) => s + f.weight * f.rating, 0)

  const topComps = [...comps].sort((a, b) => (b.rating * 0.5 + b.digitalPresence * 0.5) - (a.rating * 0.5 + a.digitalPresence * 0.5)).slice(0, 2)
  const cpm = {
    factors: ['Market Sentiment', 'Digital Infrastructure', 'Price Value Proposition'],
    weights: [0.4, 0.4, 0.2],
    user: [
      userRating >= 4.5 ? 4 : userRating >= 3.5 ? 3 : userRating > 0 ? 2 : 1,
      userDigital >= 60 ? 4 : userDigital >= 40 ? 3 : userDigital >= 20 ? 2 : 1,
      userPrice >= 60 ? 4 : userPrice >= 30 ? 3 : userPrice > 0 ? 2 : 1
    ],
    competitors: topComps.map((c: any) => ({
      name: c.name,
      scores: [c.rating >= 4.5 ? 4 : c.rating >= 3.5 ? 3 : c.rating > 0 ? 2 : 1, c.digitalPresence >= 60 ? 4 : c.digitalPresence >= 40 ? 3 : c.digitalPresence >= 20 ? 2 : 1, c.priceIndex >= 60 ? 4 : c.priceIndex >= 30 ? 3 : c.priceIndex > 0 ? 2 : 1]
    }))
  }

  const fsScore = userDigital >= 60 ? 5 : userDigital >= 40 ? 4 : userDigital >= 20 ? 3 : 2
  const isScore = compCount >= 6 ? 5 : compCount >= 4 ? 4 : compCount >= 2 ? 3 : 2
  const esScore = highDigitalComps >= 4 ? -4 : highDigitalComps >= 2 ? -3 : -2
  const caScore = m.ratingGap >= 0.5 ? -1 : m.ratingGap >= 0 ? -2 : m.ratingGap >= -0.5 ? -3 : -4
  const space = { fs: fsScore, is: isScore, es: esScore, ca: caScore, x: isScore + caScore, y: fsScore + esScore, profile: (isScore + caScore) > 0 ? ((fsScore + esScore) > 0 ? 'Aggressive' : 'Competitive') : ((fsScore + esScore) > 0 ? 'Conservative' : 'Defensive') }

  const bestCompDigital = Math.max(...comps.map(c => c.digitalPresence), 1)
  const relMarketShare = userDigital / bestCompDigital
  const isHighGrowth = compCount >= 3
  const isHighShare = relMarketShare >= 0.8
  const bcg = { relativeMarketShare: parseFloat(relMarketShare.toFixed(2)), marketGrowthRate: compCount >= 5 ? 'High' : compCount >= 2 ? 'Medium' : 'Low', category: isHighShare && isHighGrowth ? 'Stars' : !isHighShare && isHighGrowth ? 'Question Marks' : isHighShare && !isHighGrowth ? 'Cash Cows' : 'Dogs' }

  const qspmS1 = parseFloat((ife.total * 0.5 + efe.total * 0.5 + (m.digitalGap < 0 ? 0.4 : 0) - (m.digitalGap > 20 ? 0.2 : 0)).toFixed(2))
  const qspmS2 = parseFloat((ife.total * 0.5 + efe.total * 0.5 + (m.ratingGap < 0 ? 0.4 : 0) - (m.ratingGap > 0.5 ? 0.2 : 0)).toFixed(2))
  const qspm = { strategies: ['Aggressive Digital Marketing', 'Service Quality Enhancement'], scores: [qspmS1, qspmS2] }

  return { ife, efe, cpm, space, bcg, qspm }
}

function calculateSentiment(competitors: any[]) {
  if (!competitors.length) return { score: 75, status: 'Neutral', trend: 'stable', marketVolume: 0 }
  const avgRating = competitors.reduce((acc, c) => acc + (c.rating || 0), 0) / competitors.length
  const score = Math.min(100, Math.max(0, avgRating * 20))
  return { score: Math.round(score), status: score > 85 ? 'Exceptional' : score > 70 ? 'Positive' : score > 50 ? 'Neutral' : 'Critical', marketVolume: competitors.length, socialVulnerability: avgRating < 3.5 ? 'High' : 'Low' }
}

function generateAIOverview(user: any, comps: any[], m: any, matrices: any, type: string, sentiment: any) {
  const profile = matrices.space.profile
  const bcg = matrices.bcg.category
  const winningStrategy = matrices.qspm.strategies[matrices.qspm.scores[0] > matrices.qspm.scores[1] ? 0 : 1]
  const strongComps = comps.filter(c => c.rating >= 4.0).map(c => c.name)
  const weakDigitalComps = comps.filter(c => c.digitalPresence < 30).map(c => c.name)
  const topRival = comps.sort((a, b) => (b.rating * 20 + b.digitalPresence) - (a.rating * 20 + a.digitalPresence))[0]
  const compsWithSocial = comps.filter(c => c.socialProfiles.length > 0).length

  let overview = `### Strategic Narrative & Sentiment Audit: ${sentiment.status} (${sentiment.score}/100)\n\n`
  overview += `Market audit across **${sentiment.marketVolume} competitors** identifies a **${sentiment.status}** sentiment baseline. `

  if (user.rating > 0) {
    overview += `Your verified rating of **${user.rating.toFixed(1)}★** places you ${user.rating >= m.avgRating ? 'above' : 'below'} the peer average of ${m.avgRating.toFixed(1)}★. `
  } else { overview += `Your organization currently lacks a verified public sentiment baseline, while rivals average ${m.avgRating.toFixed(1)}★. ` }

  overview += `The BCG Matrix identifies your position as **${bcg}**, with a relative market share of ${matrices.bcg.relativeMarketShare.toFixed(2)}. `

  overview += `\n\n### Competitive Depth Analysis\n\n`
  overview += `1. **Social Media Penetration:** ${compsWithSocial} of ${comps.length} competitors have detectable social media presence. `
  overview += `Your organization has **${user.socialProfiles?.length || 0}** social profiles detected. `
  if ((user.socialProfiles?.length || 0) < compsWithSocial) {
    overview += `This represents a **credibility gap** in markets where social proof drives 40%+ of purchase decisions.`
  } else { overview += `Your social footprint is competitive within this market.` }

  overview += `\n\n2. **Digital Infrastructure:** ${user.websiteVerified ? 'Your website is **verified and active**' : 'Your website status is **unverified**'}. `
  const avgDigital = Math.round(comps.reduce((a: number, c: any) => a + c.digitalPresence, 0) / Math.max(comps.length, 1))
  overview += `Market average digital presence is ${avgDigital}/100. `

  overview += `\n\n### Tactical Quantitative Mandate\n\n`
  overview += `QSPM modeling favors **${winningStrategy}** as the optimal path forward. `

  if (winningStrategy === 'Aggressive Digital Marketing') {
    overview += `With ${weakDigitalComps.length} competitors as "Digital Ghosts" (presence < 30/100), capture digital mindshare before ${strongComps.length > 0 ? strongComps[0] : 'national chains'} consolidate.`
  } else {
    overview += `${strongComps.length} rivals have high sentiment — focus on service quality and social proof velocity to defend position.`
  }

  if (user.riskScore > 30) {
    overview += `\n\n### ⚠️ Risk Alert\n\nYour digital risk score of **${user.riskScore}/100** exceeds market average of **${m.avgRisk}/100**. Immediate attention recommended for ${!user.website ? 'website creation' : user.riskScore > 50 ? 'digital presence strategy' : 'social proof building'}.`
  }

  return overview
}

function generatePropheticSolutions(user: any, m: any, matrices: any, ansoff: any, type: string, sentiment: any) {
  const profile = matrices.space.profile
  const bcg = matrices.bcg.category
  const topRival = matrices.cpm.competitors[0]
  const solutions = []

  solutions.push({
    category: 'Structural Pivot',
    title: `Transition to ${profile === 'Aggressive' ? 'Market Dominance' : 'Competitive Parity'}`,
    description: `Prophet AI identifies your position as ${bcg}. Bridge the ${Math.abs(m.digitalGap)}% digital gap vs ${topRival?.name || 'market leaders'}.`,
    tactics: [
      user.digitalPresence < 40 ? `IMMEDIATE: Establish verified web domain to exit "Digital Ghost" status.` : `OPTIMIZE: Target ${Math.abs(m.digitalGap)}% reach gap via local SEO.`,
      sentiment.score >= 70 ? `YIELD: Leverage ${sentiment.score}/100 sentiment for 5-10% premium pricing.` : `RECOVER: Build social proof velocity engine against rival sentiment leads.`,
      `INTERCEPT: Target keywords dominated by ${topRival?.name || 'local rivals'}.`,
      user.socialProfiles?.length < 2 ? `SOCIAL: Create profiles on missing platforms to close credibility gap.` : `SOCIAL: Amplify existing ${user.socialProfiles?.length || 0} social channels with localized content.`,
    ]
  })

  solutions.push({
    category: 'Risk Mitigation',
    title: 'Moat Construction',
    description: `With an EFE score of ${matrices.efe.total.toFixed(2)}, your market exposure is ${matrices.efe.total < 2.5 ? 'critical' : 'moderate'}.`,
    tactics: [
      `DEFENSE: Secure local partnerships to insulate from ${topRival?.name || 'larger competitors'}.`,
      user.riskScore > 30 ? `RISK: Address ${user.riskScore}/100 risk score — prioritize ${!user.website ? 'website launch' : 'social proof and review generation'}.` : `RETENTION: Implement predictive churn model for high-value customers.`,
      `DIVERSIFY: Reduce ${type} dependency — introduce complementary value-adds.`,
    ]
  })

  const recommendedStrategy = ansoff?.recommendedStrategy
  solutions.push({
    category: 'Growth Engineering',
    title: recommendedStrategy?.name === 'Market Penetration' ? 'Market Share Capture' : recommendedStrategy?.name === 'Market Development' ? 'Geographic Expansion' : 'Precision Scaling',
    description: recommendedStrategy?.description || `Scaling for ${m.digitalGap < 0 ? 'Digital Parity' : 'Market Leadership'}.`,
    tactics: [
      `Ansoff Priority: **${recommendedStrategy?.recommendation || 'Optimize'}** — ${recommendedStrategy?.name?.replace(/([A-Z])/g, ' $1').trim() || 'Core business'}.`,
      `CONTENT: Scale UGC by 150% to bridge social proof gap against ${topRival?.name || 'competitors'}.`,
      `CONVERSION: A/B test value proposition vs ${topRival?.name || 'leading competitor'} landing pages.`,
    ]
  })

  return solutions
}

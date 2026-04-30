/**
 * Client-side analytics engine for auto insights, forecasting, and pattern detection.
 * All computation is done in the browser — no external AI API required.
 */

export type InsightSeverity = 'info' | 'success' | 'warning' | 'critical'
export type InsightCategory = 'trend' | 'outlier' | 'forecast' | 'summary' | 'pattern' | 'correlation'

export interface Insight {
  id: string
  category: InsightCategory
  severity: InsightSeverity
  title: string
  description: string
  value?: string | number
  change?: number // percentage change
  data?: any // supporting data (e.g. forecast points)
}

export interface ForecastPoint {
  name: string
  actual?: number
  forecast: number
  lower: number
  upper: number
}

export interface AnalysisResult {
  insights: Insight[]
  forecast: ForecastPoint[]
  summary: {
    total: number
    average: number
    min: number
    max: number
    count: number
    stdDev: number
    trend: 'up' | 'down' | 'stable'
    trendStrength: number // 0-1
    growthRate: number // percentage
  }
  narrative: string
}

// ─── Math Utilities ─────────────────────────────────────────────────────────

function mean(values: number[]): number {
  if (values.length === 0) return 0
  return values.reduce((a, b) => a + b, 0) / values.length
}

function stdDev(values: number[]): number {
  if (values.length < 2) return 0
  const avg = mean(values)
  const variance = values.reduce((acc, v) => acc + Math.pow(v - avg, 2), 0) / (values.length - 1)
  return Math.sqrt(variance)
}

function zScore(value: number, avg: number, sd: number): number {
  if (sd === 0) return 0
  return (value - avg) / sd
}

function linearRegression(xs: number[], ys: number[]): { slope: number; intercept: number; r2: number } {
  const n = xs.length
  if (n < 2) return { slope: 0, intercept: ys[0] || 0, r2: 0 }

  const sumX = xs.reduce((a, b) => a + b, 0)
  const sumY = ys.reduce((a, b) => a + b, 0)
  const sumXY = xs.reduce((acc, x, i) => acc + x * ys[i], 0)
  const sumX2 = xs.reduce((acc, x) => acc + x * x, 0)

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)
  const intercept = (sumY - slope * sumX) / n

  // R² coefficient of determination
  const yMean = sumY / n
  const ssTot = ys.reduce((acc, y) => acc + Math.pow(y - yMean, 2), 0)
  const ssRes = ys.reduce((acc, y, i) => acc + Math.pow(y - (slope * xs[i] + intercept), 2), 0)
  const r2 = ssTot === 0 ? 1 : 1 - ssRes / ssTot

  return { slope, intercept, r2 }
}

function movingAverage(values: number[], window: number): number[] {
  return values.map((_, i) => {
    const start = Math.max(0, i - Math.floor(window / 2))
    const end = Math.min(values.length, start + window)
    const slice = values.slice(start, end)
    return mean(slice)
  })
}

// ─── Main Analysis Function ──────────────────────────────────────────────────

export function analyzeData(
  rows: Record<string, unknown>[],
  xCol: string,
  yCol: string,
  forecastPeriods = 3
): AnalysisResult {
  if (rows.length < 2) {
    return {
      insights: [{ id: 'no-data', category: 'summary', severity: 'info', title: 'Not enough data', description: 'Upload more data rows to generate insights.' }],
      forecast: [],
      summary: { total: 0, average: 0, min: 0, max: 0, count: 0, stdDev: 0, trend: 'stable', trendStrength: 0, growthRate: 0 },
      narrative: 'Not enough data rows to generate a meaningful analysis.'
    }
  }

  // Extract Y values (numeric)
  const yValues = rows
    .map(r => {
      const v = r[yCol]
      return typeof v === 'number' ? v : parseFloat(String(v))
    })
    .filter(v => !isNaN(v))

  const xLabels = rows.map(r => String(r[xCol] || ''))
  const xs = yValues.map((_, i) => i)

  if (yValues.length < 2) {
    return {
      insights: [{ id: 'no-numeric', category: 'summary', severity: 'warning', title: 'No numeric values', description: `Column "${yCol}" contains no numeric data.` }],
      forecast: [],
      summary: { total: 0, average: 0, min: 0, max: 0, count: 0, stdDev: 0, trend: 'stable', trendStrength: 0, growthRate: 0 },
      narrative: `Column "${yCol}" contains no numeric data, so no trend or summary can be generated.`
    }
  }

  const avg = mean(yValues)
  const sd = stdDev(yValues)
  const total = yValues.reduce((a, b) => a + b, 0)
  const minVal = Math.min(...yValues)
  const maxVal = Math.max(...yValues)
  const { slope, intercept, r2 } = linearRegression(xs, yValues)

  // Trend classification
  const trendStrength = Math.abs(r2)
  let trend: 'up' | 'down' | 'stable' = 'stable'
  if (Math.abs(slope) > sd * 0.05) {
    trend = slope > 0 ? 'up' : 'down'
  }

  // Growth rate (first half vs second half)
  const midpoint = Math.floor(yValues.length / 2)
  const firstHalfMean = mean(yValues.slice(0, midpoint))
  const secondHalfMean = mean(yValues.slice(midpoint))
  const growthRate = firstHalfMean !== 0
    ? ((secondHalfMean - firstHalfMean) / Math.abs(firstHalfMean)) * 100
    : 0
  
  const data = xLabels.map((label, i) => ({
    name: label,
    value: yValues[i] || 0
  }))

  // ─── Build Insights ───────────────────────────────────────────────────────
  const insights: Insight[] = []

  // 1. Trend insight
  const trendPct = Math.abs(growthRate).toFixed(1)
  if (trendStrength > 0.3) {
    insights.push({
      id: 'trend',
      category: 'trend',
      severity: growthRate > 0 ? 'success' : 'warning',
      title: trend === 'up' ? `📈 Upward Trend Detected` : trend === 'down' ? `📉 Downward Trend Detected` : '➡️ Stable Trend',
      description: trend !== 'stable'
        ? `${yCol} is ${trend === 'up' ? 'growing' : 'declining'} by approximately ${trendPct}% comparing the first half of data to the second half. R² = ${r2.toFixed(2)} confidence.`
        : `${yCol} is relatively stable with low variance across the dataset.`,
      change: growthRate,
    })
  }

  // 2. Outlier detection (Z-score > 2)
  const outliers = yValues
    .map((v, i) => ({ value: v, label: xLabels[i], z: Math.abs(zScore(v, avg, sd)) }))
    .filter(o => o.z > 2)
    .sort((a, b) => b.z - a.z)

  if (outliers.length > 0) {
    const top = outliers[0]
    insights.push({
      id: 'outlier-top',
      category: 'outlier',
      severity: 'warning',
      title: `⚠️ Outlier Detected: ${top.label}`,
      description: `"${top.label}" has an unusually ${top.value > avg ? 'high' : 'low'} value of ${top.value.toLocaleString()} — ${top.z.toFixed(1)}× standard deviations from the mean (${avg.toFixed(0)}). This may indicate a data entry error or a significant event.`,
      value: top.value,
    })
  }

  // 3. Top performer
  const maxIdx = yValues.indexOf(maxVal)
  insights.push({
    id: 'top-performer',
    category: 'summary',
    severity: 'success',
    title: `🏆 Top Performer: ${xLabels[maxIdx]}`,
    description: `"${xLabels[maxIdx]}" has the highest ${yCol} at ${maxVal.toLocaleString()}, which is ${avg > 0 ? ((maxVal / avg - 1) * 100).toFixed(0) : 0}% above the average of ${avg.toLocaleString()}.`,
    value: maxVal,
  })

  // 4. Bottom performer
  const minIdx = yValues.indexOf(minVal)
  if (minIdx !== maxIdx) {
    insights.push({
      id: 'bottom-performer',
      category: 'summary',
      severity: minVal < 0 ? 'critical' : 'info',
      title: `${minVal < 0 ? '🔴' : '📊'} Lowest: ${xLabels[minIdx]}`,
      description: `"${xLabels[minIdx]}" has the lowest ${yCol} at ${minVal.toLocaleString()}, ${avg > 0 ? ((1 - minVal / avg) * 100).toFixed(0) : 0}% below average.`,
      value: minVal,
    })
  }

  // 5. Volatility / consistency
  const cv = avg !== 0 ? (sd / Math.abs(avg)) * 100 : 0
  if (cv > 50) {
    insights.push({
      id: 'volatility',
      category: 'pattern',
      severity: 'warning',
      title: `🌊 High Volatility (CV=${cv.toFixed(0)}%)`,
      description: `${yCol} shows high variability (coefficient of variation = ${cv.toFixed(0)}%). Results are inconsistent — investigate what's driving the swings.`,
    })
  } else if (cv < 10 && yValues.length > 3) {
    insights.push({
      id: 'consistent',
      category: 'pattern',
      severity: 'success',
      title: `✅ Very Consistent Performance`,
      description: `${yCol} is highly consistent across all categories (CV = ${cv.toFixed(1)}%). Low variability suggests stable, predictable performance.`,
    })
  }

  // 6. Moving average smoothing pattern
  if (yValues.length >= 5) {
    const ma = movingAverage(yValues, 3)
    const recentMA = mean(ma.slice(-3))
    const earlyMA = mean(ma.slice(0, 3))
    const maGrowth = earlyMA !== 0 ? ((recentMA - earlyMA) / Math.abs(earlyMA)) * 100 : 0
    if (Math.abs(maGrowth) > 10) {
      insights.push({
        id: 'moving-avg',
        category: 'pattern',
        severity: maGrowth > 0 ? 'success' : 'warning',
        title: `📊 3-Period Moving Average ${maGrowth > 0 ? 'Rising' : 'Falling'}`,
        description: `The smoothed trend shows a ${Math.abs(maGrowth).toFixed(0)}% ${maGrowth > 0 ? 'increase' : 'decrease'} from early to recent periods. This confirms the ${maGrowth > 0 ? 'upward' : 'downward'} direction.`,
        change: maGrowth,
      })
    }
  }

  // ─── Forecast (Linear Regression Extrapolation) ────────────────────────────
  const stdErr = sd * Math.sqrt(1 + 1 / yValues.length) // simplified prediction interval

  // Historical points
  const historicalForecast: ForecastPoint[] = yValues.map((val, i) => ({
    name: xLabels[i] || `T${i + 1}`,
    actual: val,
    forecast: Math.max(0, slope * i + intercept),
    lower: Math.max(0, slope * i + intercept - stdErr),
    upper: slope * i + intercept + stdErr,
  }))

  // Future forecast points
  const futureForecast: ForecastPoint[] = []
  for (let i = 0; i < forecastPeriods; i++) {
    const futureIdx = yValues.length + i
    const projected = slope * futureIdx + intercept
    futureForecast.push({
      name: `Forecast +${i + 1}`,
      forecast: Math.max(0, projected),
      lower: Math.max(0, projected - stdErr * (1 + i * 0.1)),
      upper: projected + stdErr * (1 + i * 0.1),
    })
  }

  // Forecast insight
  const nextForecast = futureForecast[0]
  if (nextForecast && r2 > 0.4) {
    const direction = nextForecast.forecast > avg ? 'above' : 'below'
    insights.push({
      id: 'forecast',
      category: 'forecast',
      severity: nextForecast.forecast > avg ? 'success' : 'warning',
      title: `🔮 Forecast: ${nextForecast.forecast.toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
      description: `Based on linear trend (R²=${r2.toFixed(2)}), the next period is projected at ${nextForecast.forecast.toLocaleString(undefined, { maximumFractionDigits: 0 })}, ${direction} the current average. Range: ${nextForecast.lower.toLocaleString(undefined, { maximumFractionDigits: 0 })} – ${nextForecast.upper.toLocaleString(undefined, { maximumFractionDigits: 0 })}.`,
      data: { lower: nextForecast.lower, upper: nextForecast.upper },
    })
  }

  return {
    insights,
    forecast: [...historicalForecast, ...futureForecast],
    summary: {
      total,
      average: avg,
      min: minVal,
      max: maxVal,
      count: yValues.length,
      stdDev: sd,
      trend,
      trendStrength,
      growthRate,
      seasonality: detectSeasonality(data, yCol)
    },
    narrative: generateRealReport({ 
      insights, 
      summary: { 
        total, 
        average: avg, 
        min: minVal, 
        max: maxVal, 
        count: yValues.length, 
        stdDev: sd, 
        trend, 
        trendStrength, 
        growthRate,
        seasonality: detectSeasonality(data, yCol)
      }, 
      xCol, 
      yCol,
      correlations: detectCorrelations(rows, Object.keys(rows[0] || {}).filter(k => typeof rows[0][k] === 'number'))
    }, xLabels)
  }
}

function detectSeasonality(data: any[], yCol: string) {
  if (data.length < 8) return { hasSeasonality: false };
  const yValues = data.map(d => Number(d.value) || 0);
  const mean = yValues.reduce((a, b) => a + b, 0) / yValues.length;
  const peaks = data.filter(d => (Number(d.value) || 0) > mean * 1.5);
  if (peaks.length > 0 && peaks.length < data.length * 0.4) {
    return {
      hasSeasonality: true,
      peakSegments: peaks.map(p => p.name).slice(0, 3),
      impact: peaks.length / data.length > 0.2 ? 'High' : 'Moderate'
    };
  }
  return { hasSeasonality: false };
}

function generateRealReport(result: { 
  insights: Insight[], 
  summary: AnalysisResult['summary'], 
  xCol: string, 
  yCol: string,
  correlations: any[]
}, xLabels: string[]): string {
  const { summary, insights, yCol, xCol, correlations } = result
  const sections: string[] = []

  const volatility = (summary.stdDev / summary.average * 100);
  const confidence = (summary.trendStrength * 100).toFixed(0);

  // SECTION 1: EXECUTIVE AUDIT
  sections.push(`### EXECUTIVE STRATEGIC AUDIT: ${yCol.toUpperCase()}\n`)
  sections.push(`Our deterministic analysis of ${summary.count} data points reveals a **${summary.trend === 'up' ? 'Positive Growth Trajectory' : 'Market Contraction'}** phase. ` +
                `The aggregate volume of ${summary.total.toLocaleString()} units maintains a mean density of ${summary.average.toLocaleString(undefined, { maximumFractionDigits: 1 })}. ` +
                `With a Trend Confidence of ${confidence}%, this model indicates a ${summary.trendStrength > 0.8 ? 'highly stable' : 'dynamic'} environment.`)

  // SECTION 2: PERFORMANCE BREAKDOWN
  const top = insights.find(i => i.id === 'top-performer')
  const bottom = insights.find(i => i.id === 'bottom-performer')
  sections.push(`\n**Performance Metrics:**\n` +
                `- **Benchmark Alpha:** ${top?.title.replace('🏆 Top Performer: ', '')} (${summary.max.toLocaleString()})\n` +
                `- **Performance Floor:** ${bottom?.title.replace(' Lowest: ', '')} (${summary.min.toLocaleString()})\n` +
                `- **Volatility Index:** ${volatility.toFixed(1)}% (Standard Deviation: ${summary.stdDev.toFixed(1)})`)

  // SECTION 3: MULTI-DIMENSIONAL CORRELATIONS
  if (correlations.length > 0) {
    const best = correlations[0];
    sections.push(`\n**Inter-Dependency Analysis:**\n` +
                  `We detected a **${Math.abs(best.r) > 0.8 ? 'Primary' : 'Secondary'} ${best.r > 0 ? 'Positive' : 'Negative'} Correlation** between ${best.colA} and ${best.colB} (r=${best.r.toFixed(2)}). ` +
                  `This suggests that shifts in ${best.colA} are a ${best.r > 0 ? 'leading indicator' : 'inverse driver'} for ${best.colB} performance.`)
  }

  // SECTION 4: ANOMALY & RISK ASSESSMENT
  const outlier = insights.find(i => i.category === 'outlier')
  if (outlier) {
    sections.push(`\n**Risk Alert:** A critical anomaly was detected at **${outlier.title.replace('⚠️ Outlier Detected: ', '')}**. ` +
                  `This point deviates ${outlier.value ? (Number(outlier.value) / summary.average).toFixed(1) : 'X'}x from the cohort mean, suggesting either a systemic breakthrough or a data integrity failure that requires immediate audit.`)
  }

  // SECTION 5: STRATEGIC ROADMAP (PROPHETIC SOLUTIONS)
  sections.push(`\n**Strategic Roadmap:**\n`)
  if (summary.trend === 'up' && summary.growthRate > 15) {
    sections.push(`1. **Scale Operations:** Current momentum supports a 15-20% capacity increase.\n2. **Optimize Yield:** Focus on the ${top?.title.replace('🏆 Top Performer: ', '')} segment to maximize ROI.\n3. **Defensive Buffering:** Build reserves against the detected ${volatility > 30 ? 'high' : 'moderate'} volatility.`)
  } else if (summary.trend === 'down') {
    sections.push(`1. **Contraction Protocol:** Reduce exposure in the ${bottom?.title.replace(' Lowest: ', '')} segment immediately.\n2. **Pivot Analysis:** Re-evaluate the correlation between ${yCol} and market drivers.\n3. **Stabilization:** Implement a floor of ${summary.average.toFixed(0)} to prevent further decay.`)
  } else {
    sections.push(`1. **Efficiency Gains:** Maintain the current stable posture while seeking 5% marginal gains.\n2. **Segment Migration:** Shift focus from low-yield areas towards the median.\n3. **Predictive Monitoring:** Watch for breaks in the ${confidence}% confidence channel.`)
  }

  return sections.join('\n')
}

// ─── Detect correlations between multiple numeric columns ────────────────────

export function detectCorrelations(
  rows: Record<string, unknown>[],
  numericCols: string[]
): { colA: string; colB: string; r: number; description: string }[] {
  const results: { colA: string; colB: string; r: number; description: string }[] = []

  const extract = (col: string) =>
    rows.map(r => {
      const v = r[col]
      return typeof v === 'number' ? v : parseFloat(String(v))
    }).filter(v => !isNaN(v))

  for (let i = 0; i < numericCols.length; i++) {
    for (let j = i + 1; j < numericCols.length; j++) {
      const a = extract(numericCols[i])
      const b = extract(numericCols[j])
      const n = Math.min(a.length, b.length)
      if (n < 3) continue

      const ma = mean(a.slice(0, n))
      const mb = mean(b.slice(0, n))
      const num = a.slice(0, n).reduce((acc, ai, k) => acc + (ai - ma) * (b[k] - mb), 0)
      const den = Math.sqrt(
        a.slice(0, n).reduce((acc, ai) => acc + Math.pow(ai - ma, 2), 0) *
        b.slice(0, n).reduce((acc, bi) => acc + Math.pow(bi - mb, 2), 0)
      )
      const r = den === 0 ? 0 : num / den

      if (Math.abs(r) > 0.6) {
        const strength = Math.abs(r) > 0.85 ? 'very strong' : Math.abs(r) > 0.7 ? 'strong' : 'moderate'
        const dir = r > 0 ? 'positive' : 'negative'
        results.push({
          colA: numericCols[i],
          colB: numericCols[j],
          r,
          description: `${strength.charAt(0).toUpperCase() + strength.slice(1)} ${dir} correlation (r=${r.toFixed(2)}) between ${numericCols[i]} and ${numericCols[j]}.`,
        })
      }
    }
  }

  return results.sort((a, b) => Math.abs(b.r) - Math.abs(a.r))
}

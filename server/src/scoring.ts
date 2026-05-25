export type DailyInput = {
  date: string
  tempMax: number
  precipitation: number
  windMax: number
  snowfall: number
}

export type DayScore = {
  date: string
  score: number // percent 0-100
  reason: string
}

export type ActivityScores = {
  activity: string
  daily: DayScore[]
  avgScore: number
}

const clamp = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v))

const toPercent = (v: number) => Math.round(v * 100) / 100

// Configuration constants — centralised for easy tuning
export const CONFIG = {
  surfing: {
    idealTemp: 20, // °C — comfortable water/air temp
    tempRange: 15, // linear scaling around ideal
    idealWind: 10, // m/s — best wind for waves (example)
    windHalfWidth: 6, // half-width for triangular wind score
    rainToleranceMm: 10, // mm — heavier rain reduces desirability
    weights: { temp: 0.4, wind: 0.5, rain: 0.1 },
  },
  skiing: {
    snowScale: 10, // scale factor for snowfall contribution
    coldBoostTemp: 0, // threshold for cold bonus
  },
}

function triangularScore(x: number, ideal: number, halfWidth: number) {
  // 1 at ideal, decreasing linearly to 0 at (ideal +/- halfWidth)
  return clamp(1 - Math.abs(x - ideal) / halfWidth, 0, 1)
}

function linearNormalized(value: number, min: number, max: number) {
  if (max <= min) return 0
  return clamp((value - min) / (max - min), 0, 1)
}

export function scoreSurfing(d: DailyInput) {
  const c = CONFIG.surfing
  // temp score: closer to ideal temp is better; allow linear scaling
  const tempScore = clamp(1 - Math.abs(d.tempMax - c.idealTemp) / c.tempRange, 0, 1)

  // wind score: triangular optimum centered at idealWind
  const windScore = triangularScore(d.windMax, c.idealWind, c.windHalfWidth)

  // rain penalty: 1 at 0mm, 0 at >= rainToleranceMm
  const rainPenalty = clamp(1 - d.precipitation / c.rainToleranceMm, 0, 1)

  const w = c.weights
  const combined = clamp(tempScore * w.temp + windScore * w.wind + rainPenalty * w.rain, 0, 1)

  const reason = `temp ${d.tempMax}°C, wind ${d.windMax}m/s, precip ${d.precipitation}mm`
  return { date: d.date, score: toPercent(combined * 100), reason }
}

export function scoreSkiing(d: DailyInput) {
  const snowFactor = clamp(d.snowfall / CONFIG.skiing.snowScale, 0, 1)
  const coldBonus = d.tempMax <= 0 ? 0.7 : d.tempMax <= 5 ? 0.4 : 0
  const combined = clamp(snowFactor * 0.7 + coldBonus * 0.3, 0, 1)
  const reason = `temp ${d.tempMax}°C, snowfall ${d.snowfall}mm`
  return { date: d.date, score: toPercent(combined * 100), reason }
}

export function scoreOutdoorSightseeing(d: DailyInput) {
  const tempComfort = 1 - Math.min(Math.abs(d.tempMax - 18) / 15, 1)
  const rainPenalty = clamp(1 - d.precipitation / 10, 0, 1)
  const combined = clamp(tempComfort * 0.7 + rainPenalty * 0.3, 0, 1)
  const reason = `temp ${d.tempMax}°C, precip ${d.precipitation}mm`
  return { date: d.date, score: toPercent(combined * 100), reason }
}

export function scoreIndoorSightseeing(d: DailyInput) {
  const rainBoost = clamp(d.precipitation / 10, 0, 1)
  const coldBoost = d.tempMax <= 5 ? 0.5 : 0
  const combined = clamp(rainBoost * 0.7 + coldBoost * 0.3, 0, 1)
  const reason = `temp ${d.tempMax}°C, precip ${d.precipitation}mm`
  return { date: d.date, score: toPercent(combined * 100), reason }
}

export function computeActivityScores(dailyInputs: DailyInput[]) {
  const activities = ['Skiing', 'Surfing', 'Outdoor sightseeing', 'Indoor sightseeing']

  const activityScores: ActivityScores[] = activities.map((act) => {
    const daily = dailyInputs.map((d) => {
      if (act === 'Skiing') return scoreSkiing(d)
      if (act === 'Surfing') return scoreSurfing(d)
      if (act === 'Outdoor sightseeing') return scoreOutdoorSightseeing(d)
      return scoreIndoorSightseeing(d)
    })
    const avg = daily.reduce((s, v) => s + v.score, 0) / (daily.length || 1)
    return { activity: act, daily, avgScore: toPercent(avg) }
  })

  return activityScores
}

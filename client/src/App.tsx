import React, { useState, useEffect } from 'react'
import SearchBox from './components/SearchBox'
import { gql, useLazyQuery } from '@apollo/client'
import './styles.css';

const GET_RANKING = gql`
  query GetActivityRanking($city: String!) {
    getActivityRanking(city: $city) {
      activities {
        activity
        avgScore
        daily { date score reason }
      }
      ranking
    }
  }
`;

export default function App() {
  const [city, setCity] = useState<string | null>(null)
  const [rankingData, setRankingData] = useState<any | null>(null)
  const [loadRanking, { data, loading, error }] = useLazyQuery(GET_RANKING)

  useEffect(() => {
    if (data && data.getActivityRanking) {
      setRankingData(data.getActivityRanking)
    }
  }, [data])

  const handleSelect = (cityName: string) => {
    if (!cityName) {
      setCity(null)
      setRankingData(null)
      return
    }
    setCity(cityName)
    setRankingData(null)
    loadRanking({ variables: { city: cityName } })
  }

  return (
    <div className="container py-4">
      <h1 className="mb-4 app-title">Wheather activity for next 7 days</h1>
      <SearchBox onSelect={handleSelect} />

      {loading && <div className="mt-3">Loading ranking...</div>}
      {error && <div className="alert alert-danger mt-3">{error.message}</div>}

      {rankingData && (
        <div className="mt-4">
          <div className="card city-card">
            <div className="card-body">
              <h3 className="card-title">{city}</h3>
              <div className="text-muted">7-day overall activity ranking</div>
              <div className="ranking-chips mt-3">
                {rankingData.activities.map((act: any, idx: number) => (
                  <div className="activity-chip" key={act.activity}>
                    <div className="activity-rank">#{idx + 1}</div>
                    <div className="activity-name">{act.activity}</div>
                    <div className="small-score-badge">{act.avgScore}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <h5 className="mt-3">Daily breakdown</h5>
          <div className="daily-grid">
            {rankingData.activities[0].daily.map((d: any, i: number) => (
              <div className="card day-card" key={d.date}>
                <div className="card-body">
                  <div className="d-flex justify-content-between">
                    <div>
                      <div className="fw-bold">{formatDate(d.date)}</div>
                      <div className="day-summary">{d.reason}</div>
                      <div className="mt-1">Best: <span className="best-activity">{bestActivityForDate(rankingData.activities, i)}</span></div>
                    </div>
                    <div className="text-end">
                      <div className="small-score-badge">{bestScoreForDate(rankingData.activities, i)}</div>
                    </div>
                  </div>

                  <div className="mt-3">
                    {rankingData.activities.map((act: any) => (
                      <div key={`${act.activity}-${d.date}`} className="mb-2">
                        <div className="d-flex justify-content-between">
                          <div>{act.activity}</div>
                          <div>{act.daily[i].score}</div>
                        </div>
                        <div className={`progress ${progressClassForActivity(act.activity)}`} style={{height: '8px'}}>
                          <div className="progress-bar" role="progressbar" style={{width: `${act.daily[i].score}%`}} aria-valuenow={act.daily[i].score} aria-valuemin={0} aria-valuemax={100}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function formatDate(dateStr: string) {
  try {
    const d = new Date(dateStr + 'T00:00:00')
    return d.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'short' })
  } catch { return dateStr }
}

function bestActivityForDate(activities: any[], idx: number) {
  let best = activities[0].activity
  let bestScore = activities[0].daily[idx].score
  for (const a of activities) {
    if (a.daily[idx].score > bestScore) { bestScore = a.daily[idx].score; best = a.activity }
  }
  return best
}

function bestScoreForDate(activities: any[], idx: number) {
  let bestScore = 0
  for (const a of activities) bestScore = Math.max(bestScore, a.daily[idx].score)
  return bestScore
}

function progressClassForActivity(name: string) {
  if (name.toLowerCase().includes('surf')) return 'surfing'
  if (name.toLowerCase().includes('outdoor')) return 'outdoor'
  if (name.toLowerCase().includes('indoor')) return 'indoor'
  return 'skiing'
}

import React, { useEffect, useState, useRef } from 'react'
import { gql, useLazyQuery } from '@apollo/client'
import '../styles.css';

const SEARCH_CITY = gql`
  query SearchCity($name: String!) {
    searchCity(name: $name) {
      name
      country
      latitude
      longitude
    }
  }
`;

type Props = { onSelect: (city: string) => void }

export default function SearchBox({ onSelect }: Props) {
  const [input, setInput] = useState('')
  const [debounced, setDebounced] = useState('')
  const [search, { data }] = useLazyQuery(SEARCH_CITY)
  const [showResults, setShowResults] = useState(false)

  const suppressDebounce = useRef(false)

  useEffect(() => {
    if (suppressDebounce.current) {
      // skip this scheduled debounce cycle because it was triggered by a programmatic change
      suppressDebounce.current = false
      setDebounced('')
      return
    }

    const id = setTimeout(() => setDebounced(input), 300)
    return () => clearTimeout(id)
  }, [input])

  useEffect(() => {
    if (debounced.length >= 2) {
      search({ variables: { name: debounced } })
      setShowResults(true)
    }
  }, [debounced])

  const results = data?.searchCity || []

  const handleSelect = (r: any) => {
    const label = `${r.name}${r.country ? ', ' + r.country : ''}`
    setInput(label)
    setShowResults(false)
    setDebounced('')
    suppressDebounce.current = true
    onSelect(label)
  }

  const handleClear = () => {
    setInput('')
    setDebounced('')
    setShowResults(false)
    suppressDebounce.current = true
    onSelect('')
  }

  return (
    <div className="search-card">
      <div className="card">
        <div className="card-body">
          <label className="form-label">Search a city or town</label>
          <div className="input-group">
            <input
              className="form-control city-search"
              placeholder="Enter city or town"
              value={input}
              onChange={(e) => { setInput(e.target.value); setShowResults(true) }}
            />
            <button className="btn btn-outline-secondary" type="button" onClick={handleClear} aria-label="Clear">
              ✕
            </button>
          </div>
        </div>
      </div>

      {showResults && results.length > 0 && (
        <div className="list-group mt-2">
          {results.map((r: any, i: number) => (
            <button
              key={`${r.name}-${i}`}
              className="list-group-item list-group-item-action"
              onClick={() => handleSelect(r)}
            >
              {r.name}{r.country ? `, ${r.country}` : ''}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

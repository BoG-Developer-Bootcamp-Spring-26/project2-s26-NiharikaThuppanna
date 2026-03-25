import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Navbar from '../components/Navbar'
import TrainList from '../components/TrainList'
import type { LineColor, TrainArrival } from '../types/marta'

const LINE_COLORS: LineColor[] = ['gold', 'red', 'green', 'blue']

const FETCH_TIMEOUT_MS = 25_000

function fetchWithTimeout(url: string, ms: number): Promise<Response> {
  const controller = new AbortController()
  const id = window.setTimeout(() => controller.abort(), ms)
  return fetch(url, { signal: controller.signal }).finally(() => window.clearTimeout(id))
}

type FilterState = {
  arriving: boolean
  scheduled: boolean
  dirA: boolean
  dirB: boolean
}

const DEFAULT_FILTERS: FilterState = {
  arriving: false,
  scheduled: false,
  dirA: false,
  dirB: false,
}

function getDirectionLabels(line: LineColor): [string, string] {
  if (line === 'green' || line === 'blue') {
    return ['Eastbound', 'Westbound']
  }
  return ['Northbound', 'Southbound']
}

function parseStations(stationData: unknown[]): string[] {
  const first = stationData[0]
  if (typeof first === 'string') {
    return (stationData as string[]).filter((s): s is string => typeof s === 'string' && s.length > 0)
  }
  return (stationData as Array<{ STATION?: string }>)
    .map((station) => station?.STATION)
    .filter((name): name is string => typeof name === 'string' && name.length > 0)
}

function isArriving(train: TrainArrival): boolean {
  const seconds = Number(train.WAITING_SECONDS ?? '')
  if (!Number.isNaN(seconds)) {
    return seconds <= 60
  }
  const waitingText = `${train.WAITING_TIME ?? ''} ${train.NEXT_ARR ?? ''}`.toLowerCase()
  return waitingText.includes('arriving')
}

function matchesDirection(directionRaw: string | undefined, directionLabel: string): boolean {
  const dir = (directionRaw ?? '').trim().toUpperCase()
  const target = directionLabel.charAt(0).toUpperCase()
  return dir.startsWith(target)
}

export default function LinesPage() {
  const { lineColor } = useParams()
  const navigate = useNavigate()
  const initialLine = useMemo<LineColor>(() => {
    return LINE_COLORS.includes(lineColor as LineColor) ? (lineColor as LineColor) : 'gold'
  }, [lineColor])

  const [currentLine, setCurrentLine] = useState<LineColor>(initialLine)
  const [trains, setTrains] = useState<TrainArrival[]>([])
  const [stations, setStations] = useState<string[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string>('')
  const [selectedStation, setSelectedStation] = useState<string | null>(null)
  const [activeFilters, setActiveFilters] = useState<FilterState>(DEFAULT_FILTERS)
  const [dirA, dirB] = useMemo(() => getDirectionLabels(currentLine), [currentLine])

  useEffect(() => {
    setCurrentLine(initialLine)
  }, [initialLine])

  useEffect(() => {
    setSelectedStation(null)
    setActiveFilters(DEFAULT_FILTERS)
  }, [currentLine])

  useEffect(() => {
    const fetchLineData = async () => {
      setLoading(true)
      setError('')

      const [trainResult, stationResult] = await Promise.allSettled([
        fetchWithTimeout(`/arrivals/${currentLine}`, FETCH_TIMEOUT_MS),
        fetchWithTimeout(`/stations/${currentLine}`, FETCH_TIMEOUT_MS),
      ])

      const nextErrors: string[] = []
      let nextTrains: TrainArrival[] = []
      let nextStations: string[] = []

      if (trainResult.status === 'fulfilled') {
        if (trainResult.value.ok) {
          nextTrains = ((await trainResult.value.json()) as TrainArrival[]) ?? []
        } else {
          nextErrors.push('Train arrivals are temporarily unavailable.')
        }
      } else if (trainResult.reason instanceof Error && trainResult.reason.name === 'AbortError') {
        nextErrors.push('Train arrivals request timed out.')
      } else {
        nextErrors.push('Train arrivals are temporarily unavailable.')
      }

      if (stationResult.status === 'fulfilled') {
        if (stationResult.value.ok) {
          const stationJson = (await stationResult.value.json()) as unknown
          const stationData = Array.isArray(stationJson) ? stationJson : []
          nextStations = parseStations(stationData)
        } else {
          nextErrors.push('Stations are temporarily unavailable.')
        }
      } else if (stationResult.reason instanceof Error && stationResult.reason.name === 'AbortError') {
        nextErrors.push('Stations request timed out.')
      } else {
        nextErrors.push('Stations are temporarily unavailable.')
      }

      setTrains(nextTrains)
      setStations(nextStations)
      setError(nextErrors.join(' '))
      setLoading(false)
    }

    fetchLineData()
  }, [currentLine])

  const handleLineChange = (nextLine: LineColor) => {
    setCurrentLine(nextLine)
    navigate(`/lines/${nextLine}`)
  }

  const toggleFilter = (key: keyof FilterState) => {
    setActiveFilters((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const filteredTrains = useMemo(() => {
    const withStation = selectedStation
      ? trains.filter((train) => (train.STATION ?? '').toUpperCase() === selectedStation.toUpperCase())
      : trains

    const withStatus = withStation.filter((train) => {
      const showArriving = activeFilters.arriving
      const showScheduled = activeFilters.scheduled
      if (!showArriving && !showScheduled) {
        return true
      }
      const arriving = isArriving(train)
      return (showArriving && arriving) || (showScheduled && !arriving)
    })

    return withStatus.filter((train) => {
      const showDirA = activeFilters.dirA
      const showDirB = activeFilters.dirB
      if (!showDirA && !showDirB) {
        return true
      }
      return (
        (showDirA && matchesDirection(train.DIRECTION, dirA)) ||
        (showDirB && matchesDirection(train.DIRECTION, dirB))
      )
    })
  }, [activeFilters, dirA, dirB, selectedStation, trains])

  const hasActiveFilters =
    selectedStation !== null || activeFilters.arriving || activeFilters.scheduled || activeFilters.dirA || activeFilters.dirB

  return (
    <main>
      <h1>Lines Page</h1>
      <p>Current line: {currentLine}</p>

      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '8px' }}>
        {LINE_COLORS.map((line) => (
          <button key={line} type="button" onClick={() => handleLineChange(line)}>
            {line}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '8px' }}>
        <button
          type="button"
          onClick={() => toggleFilter('arriving')}
          style={{ opacity: activeFilters.arriving ? 0.7 : 1 }}
        >
          Arriving
        </button>
        <button
          type="button"
          onClick={() => toggleFilter('scheduled')}
          style={{ opacity: activeFilters.scheduled ? 0.7 : 1 }}
        >
          Scheduled
        </button>
        <button
          type="button"
          onClick={() => toggleFilter('dirA')}
          style={{ opacity: activeFilters.dirA ? 0.7 : 1 }}
        >
          {dirA}
        </button>
        <button
          type="button"
          onClick={() => toggleFilter('dirB')}
          style={{ opacity: activeFilters.dirB ? 0.7 : 1 }}
        >
          {dirB}
        </button>
      </div>

      {error ? <p>{error}</p> : null}

      <Navbar
        color={currentLine}
        stations={stations}
        loading={loading}
        selectedStation={selectedStation}
        onStationClick={(station) => setSelectedStation((prev) => (prev === station ? null : station))}
      />
      <TrainList
        color={currentLine}
        trains={filteredTrains}
        loading={loading}
        emptyMessage={hasActiveFilters ? 'No Current Trains Match Filters.' : 'No trains available right now.'}
      />

      <p style={{ marginTop: '12px' }}>
        <Link to="/">Back to Home</Link>
      </p>
    </main>
  )
}

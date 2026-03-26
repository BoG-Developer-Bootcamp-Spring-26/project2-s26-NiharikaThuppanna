import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Navbar from '../components/Navbar'
import TrainList from '../components/TrainList'
import type { LineColor, TrainArrival } from '../types/marta'
import './LinesPage.css'

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

/** API may return a bare array or { data: [...] } / { stations: [...] }. */
function unwrapArray(json: unknown): unknown[] {
  if (Array.isArray(json)) {
    return json
  }
  if (json && typeof json === 'object') {
    const o = json as Record<string, unknown>
    for (const key of ['data', 'arrivals', 'trains', 'stations', 'results', 'items']) {
      const v = o[key]
      if (Array.isArray(v)) {
        return v
      }
    }
  }
  return []
}

function parseArrivals(json: unknown): TrainArrival[] {
  const raw = unwrapArray(json)
  return raw.filter((item): item is TrainArrival => item !== null && typeof item === 'object')
}

function parseStations(stationData: unknown[]): string[] {
  const first = stationData[0]
  if (typeof first === 'string') {
    return (stationData as string[]).filter((s): s is string => typeof s === 'string' && s.length > 0)
  }
  return (stationData as Array<{ STATION?: string; station?: string }>)
    .map((station) => station?.STATION ?? station?.station)
    .filter((name): name is string => typeof name === 'string' && name.length > 0)
}

function trainRecord(train: TrainArrival): Record<string, unknown> {
  return train as unknown as Record<string, unknown>
}

/** API may use STATION, station, etc. */
function getTrainStation(train: TrainArrival): string {
  const r = trainRecord(train)
  const v = r.STATION ?? r.station ?? r.Station
  return typeof v === 'string' ? v : ''
}

/** API may use DIRECTION, direction, etc. */
function getTrainDirection(train: TrainArrival): string {
  const r = trainRecord(train)
  const v = r.DIRECTION ?? r.direction ?? r.Direction
  return typeof v === 'string' ? v : ''
}

function getWaitingSeconds(train: TrainArrival): number | null {
  const r = trainRecord(train)
  const raw = r.WAITING_SECONDS ?? r.waiting_seconds
  if (raw === undefined || raw === null || raw === '') return null
  const n = Number(raw)
  return Number.isNaN(n) ? null : n
}

function normalizeStationKey(value: string): string {
  return value
    .trim()
    .replace(/\s+STATION$/i, '')
    .toUpperCase()
    .replace(/\s+/g, ' ')
}

/**
 * "Arriving" ≈ imminent / at platform soon; "Scheduled" ≈ further out.
 * API shapes vary; be lenient so toggles don't empty the list incorrectly.
 */
function isArriving(train: TrainArrival): boolean {
  const r = trainRecord(train)
  const arrivingRaw = r.ARRIVING ?? r.arriving ?? r.Arriving
  const arrivingFlag = `${arrivingRaw ?? ''}`.trim().toLowerCase()
  if (arrivingFlag === 'y' || arrivingFlag === 'true' || arrivingFlag === '1' || arrivingFlag === 't') {
    return true
  }
  const scheduledRaw = r.SCHEDULED ?? r.scheduled ?? r.Scheduled
  const scheduledFlag = `${scheduledRaw ?? ''}`.trim().toLowerCase()
  if (scheduledFlag === 'y' || scheduledFlag === 'true' || scheduledFlag === '1') {
    return false
  }

  const sec = getWaitingSeconds(train)
  if (sec !== null) {
    return sec <= 300
  }

  const wt = r.WAITING_TIME ?? train.WAITING_TIME
  const na = r.NEXT_ARR ?? train.NEXT_ARR ?? r.next_arr
  const waitingText = `${wt ?? ''} ${na ?? ''}`.toLowerCase()
  if (/(arriving|due now|due|boarding|now|approaching)/.test(waitingText)) {
    return true
  }
  const minMatch = waitingText.match(/(\d+)\s*min/)
  if (minMatch) {
    const minutes = Number(minMatch[1])
    if (!Number.isNaN(minutes) && minutes <= 5) {
      return true
    }
  }
  return false
}

function matchesDirection(directionRaw: string | undefined, directionLabel: string): boolean {
  const dir = (directionRaw ?? '').trim().toUpperCase()
  if (!dir) {
    return false
  }
  const label = directionLabel.trim().toUpperCase()
  const first = label.charAt(0)
  if (dir.startsWith(first)) {
    return true
  }
  if (label.startsWith('NORTH')) {
    return dir.includes('NORTH') || dir === 'N' || dir.startsWith('NB')
  }
  if (label.startsWith('SOUTH')) {
    return dir.includes('SOUTH') || dir === 'S' || dir.startsWith('SB')
  }
  if (label.startsWith('EAST')) {
    return dir.includes('EAST') || dir === 'E' || dir.startsWith('EB')
  }
  if (label.startsWith('WEST')) {
    return dir.includes('WEST') || dir === 'W' || dir.startsWith('WB')
  }
  return false
}

const tabClass: Record<LineColor, string> = {
  gold: 'lines-page__tab--gold',
  red: 'lines-page__tab--red',
  blue: 'lines-page__tab--blue',
  green: 'lines-page__tab--green',
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
          try {
            const body = await trainResult.value.json()
            nextTrains = parseArrivals(body)
          } catch {
            nextErrors.push('Train arrivals response could not be read.')
          }
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
          try {
            const stationJson = (await stationResult.value.json()) as unknown
            const stationData = unwrapArray(stationJson)
            nextStations = parseStations(stationData)
          } catch {
            nextErrors.push('Stations response could not be read.')
          }
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

  const handleStationSelect = (name: string | null) => {
    if (name === null) {
      setSelectedStation(null)
      return
    }
    setSelectedStation((prev) => (prev === name ? null : name))
  }

  const filteredTrains = useMemo(() => {
    const withStation = selectedStation
      ? trains.filter(
          (train) =>
            normalizeStationKey(getTrainStation(train)) === normalizeStationKey(selectedStation),
        )
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
      const d = getTrainDirection(train).trim()
      // If API omits direction, don't filter every train out
      if (!d) {
        return true
      }
      return (
        (showDirA && matchesDirection(d, dirA)) ||
        (showDirB && matchesDirection(d, dirB))
      )
    })
  }, [activeFilters, dirA, dirB, selectedStation, trains])

  const hasActiveFilters =
    selectedStation !== null || activeFilters.arriving || activeFilters.scheduled || activeFilters.dirA || activeFilters.dirB

  return (
    <div className="lines-page" data-line={currentLine}>
      <div className="lines-page__top">
        <div className="lines-page__tab-row">
          <Link to="/" className="lines-page__home-circle" aria-label="Home">
            <svg
              className="lines-page__home-icon"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden
            >
              <path
                d="M4 10.5L12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5Z"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
          <div className="lines-page__tabs" role="tablist" aria-label="MARTA rail lines">
            {LINE_COLORS.map((line) => (
              <button
                key={line}
                type="button"
                role="tab"
                aria-selected={currentLine === line}
                className={`lines-page__tab ${tabClass[line]} ${currentLine === line ? 'lines-page__tab--active' : ''}`}
                onClick={() => handleLineChange(line)}
              >
                {line}
              </button>
            ))}
          </div>
          <div className="lines-page__tab-row-spacer" aria-hidden />
        </div>

        <h1 className="lines-page__title">{currentLine.toUpperCase()}</h1>
      </div>

      {error ? <p className="lines-page__error">{error}</p> : null}

      <div className="lines-page__body">
        <Navbar
          stations={stations}
          loading={loading}
          selectedStation={selectedStation}
          onSelectStation={handleStationSelect}
        />

        <div className="lines-main">
          <div className="lines-main__filters">
            <button
              type="button"
              className={`lines-main__filter ${activeFilters.arriving ? 'lines-main__filter--on' : ''}`}
              onClick={() => toggleFilter('arriving')}
            >
              Arriving
            </button>
            <button
              type="button"
              className={`lines-main__filter ${activeFilters.scheduled ? 'lines-main__filter--on' : ''}`}
              onClick={() => toggleFilter('scheduled')}
            >
              Scheduled
            </button>
            <button
              type="button"
              className={`lines-main__filter ${activeFilters.dirA ? 'lines-main__filter--on' : ''}`}
              onClick={() => toggleFilter('dirA')}
            >
              {dirA}
            </button>
            <button
              type="button"
              className={`lines-main__filter ${activeFilters.dirB ? 'lines-main__filter--on' : ''}`}
              onClick={() => toggleFilter('dirB')}
            >
              {dirB}
            </button>
          </div>

          <TrainList
            color={currentLine}
            trains={filteredTrains}
            loading={loading}
            emptyMessage={hasActiveFilters ? 'No Current Trains Match Filters.' : 'No trains available right now.'}
          />
        </div>
      </div>
    </div>
  )
}

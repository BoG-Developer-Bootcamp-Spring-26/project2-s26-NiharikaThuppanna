import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Navbar from '../components/Navbar'
import TrainList from '../components/TrainList'
import type { LineColor, StationRecord, TrainArrival } from '../types/marta'

const LINE_COLORS: LineColor[] = ['gold', 'red', 'green', 'blue']
const API_BASE_URL = 'https://midsem-bootcamp-api.onrender.com'

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

  useEffect(() => {
    setCurrentLine(initialLine)
  }, [initialLine])

  useEffect(() => {
    const fetchLineData = async () => {
      try {
        setLoading(true)
        setError('')

        const [trainRes, stationRes] = await Promise.all([
          fetch(`${API_BASE_URL}/arrivals/${currentLine}`),
          fetch(`${API_BASE_URL}/stations/${currentLine}`),
        ])

        if (!trainRes.ok || !stationRes.ok) {
          throw new Error('Unable to fetch MARTA data right now.')
        }

        const trainData = (await trainRes.json()) as TrainArrival[]
        const stationData = (await stationRes.json()) as StationRecord[]

        setTrains(trainData)
        setStations(stationData.map((station) => station.STATION).filter((name): name is string => Boolean(name)))
      } catch (fetchError) {
        setError(fetchError instanceof Error ? fetchError.message : 'Unexpected fetch error.')
      } finally {
        setLoading(false)
      }
    }

    fetchLineData()
  }, [currentLine])

  const handleLineChange = (nextLine: LineColor) => {
    setCurrentLine(nextLine)
    navigate(`/lines/${nextLine}`)
  }

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

      {error ? <p>{error}</p> : null}

      <Navbar color={currentLine} stations={stations} loading={loading} />
      <TrainList color={currentLine} trains={trains} loading={loading} />

      <p style={{ marginTop: '12px' }}>
        <Link to="/">Back to Home</Link>
      </p>
    </main>
  )
}

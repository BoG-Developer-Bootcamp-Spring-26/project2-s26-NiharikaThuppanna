import type { LineColor } from '../types/marta'

interface NavbarProps {
  color: LineColor
  stations: string[]
  loading: boolean
  selectedStation: string | null
  onStationClick: (station: string) => void
}

export default function Navbar({ color, stations, loading, selectedStation, onStationClick }: NavbarProps) {
  return (
    <nav style={{ marginTop: '10px', marginBottom: '12px' }}>
      <h2 style={{ textTransform: 'capitalize' }}>{color} Line Stations</h2>
      {loading ? (
        <p>Loading stations...</p>
      ) : stations.length === 0 ? (
        <p>No stations available.</p>
      ) : (
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {stations.map((station) => (
            <button
              key={station}
              type="button"
              onClick={() => onStationClick(station)}
              style={{
                backgroundColor: selectedStation === station ? '#dbeafe' : 'white',
                border: '1px solid #9ca3af',
              }}
            >
              {station}
            </button>
          ))}
        </div>
      )}
    </nav>
  )
}

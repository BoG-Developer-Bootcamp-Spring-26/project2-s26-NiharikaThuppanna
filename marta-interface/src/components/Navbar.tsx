import type { LineColor } from '../types/marta'

interface NavbarProps {
  color: LineColor
  stations: string[]
  loading: boolean
}

export default function Navbar({ color, stations, loading }: NavbarProps) {
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
            <button key={station} type="button">
              {station}
            </button>
          ))}
        </div>
      )}
    </nav>
  )
}

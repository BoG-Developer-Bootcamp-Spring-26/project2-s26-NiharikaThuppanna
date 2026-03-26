interface NavbarProps {
  stations: string[]
  loading: boolean
  selectedStation: string | null
  onSelectStation: (station: string | null) => void
}

export default function Navbar({ stations, loading, selectedStation, onSelectStation }: NavbarProps) {
  const allActive = selectedStation === null

  return (
    <aside className="lines-sidebar" aria-label="Starting station">
      <p className="lines-sidebar__hint">Select your starting station</p>
      {loading ? (
        <p className="lines-sidebar__loading">Loading stations…</p>
      ) : stations.length === 0 ? (
        <p className="lines-sidebar__empty">No stations available.</p>
      ) : (
        <ul className="lines-sidebar__list">
          <li className="lines-sidebar__item">
            <button
              type="button"
              className={`lines-sidebar__btn ${allActive ? 'lines-sidebar__btn--active' : ''}`}
              onClick={() => onSelectStation(null)}
            >
              All Stations
            </button>
          </li>
          {stations.map((station) => {
            const active = selectedStation !== null && selectedStation === station
            return (
              <li key={station} className="lines-sidebar__item">
                <button
                  type="button"
                  className={`lines-sidebar__btn ${active ? 'lines-sidebar__btn--active' : ''}`}
                  onClick={() => onSelectStation(station)}
                >
                  {station}
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </aside>
  )
}

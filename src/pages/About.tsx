import { Link, useNavigate } from 'react-router-dom'

const MAP_SRC =
  'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/MARTA_map.svg/1000px-MARTA_map.svg.png'
const MAP_HREF = 'https://commons.wikimedia.org/wiki/File:MARTA_map.svg'

export default function About() {
  const navigate = useNavigate()

  return (
    <main
      style={{
        width: '100%',
        maxWidth: 'none',
        boxSizing: 'border-box',
        padding: '24px clamp(16px, 4vw, 48px) 40px',
        margin: 0,
      }}
    >
      <h1 style={{ marginTop: 0 }}>About MARTA</h1>
      <p>
        MARTA (Metropolitan Atlanta Rapid Transit Authority) operates heavy rail and bus service in the Atlanta
        region. The rail network connects key neighborhoods, universities, the airport, and downtown, and is
        a major part of daily commuting and events in the city.
      </p>
      <p>
        This student project is a practice interface for viewing line-based train arrivals and stations. It is
        not affiliated with MARTA.
      </p>

      <section style={{ marginTop: '24px' }}>
        <h2 style={{ fontSize: '1.1rem' }}>System map</h2>
        <p style={{ fontSize: '0.9rem', color: '#4b5563' }}>
          Map image from Wikimedia Commons (
          <a href={MAP_HREF} target="_blank" rel="noreferrer">
            source
          </a>
          ).
        </p>
        <a href={MAP_HREF} target="_blank" rel="noreferrer">
          <img
            src={MAP_SRC}
            alt="MARTA rail system map"
            style={{ maxWidth: '100%', height: 'auto', border: '1px solid #e5e7eb', borderRadius: '8px' }}
          />
        </a>
      </section>

      <p style={{ marginTop: '28px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <button type="button" onClick={() => navigate('/')}>
          Back to Home
        </button>
        <Link to="/">Or use this link</Link>
      </p>
    </main>
  )
}

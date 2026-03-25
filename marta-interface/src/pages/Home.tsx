import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <main>
      <h1>MARTA Home</h1>
      <p>Select a line to open the lines page:</p>

      <nav style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <Link to="/lines/gold">Gold Line</Link>
        <Link to="/lines/red">Red Line</Link>
        <Link to="/lines/green">Green Line</Link>
        <Link to="/lines/blue">Blue Line</Link>
      </nav>

      <p style={{ marginTop: '12px' }}>
        <Link to="/about">Go to About</Link>
      </p>
    </main>
  )
}

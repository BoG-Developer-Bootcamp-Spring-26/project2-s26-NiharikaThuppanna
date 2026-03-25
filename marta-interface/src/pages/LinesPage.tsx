import { Link, useParams } from 'react-router-dom'
import Navbar from '../components/Navbar'
import TrainList from '../components/TrainList'

export default function LinesPage() {
  const { lineColor } = useParams()

  return (
    <main>
      <h1>Lines Page</h1>
      <p>Current line: {lineColor ?? 'none selected'}</p>

      <Navbar />
      <TrainList />

      <p style={{ marginTop: '12px' }}>
        <Link to="/">Back to Home</Link>
      </p>
    </main>
  )
}

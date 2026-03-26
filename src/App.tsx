import { Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import About from './pages/About'
import LinesPage from './pages/LinesPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/lines/:lineColor" element={<LinesPage />} />
    </Routes>
  )
}

export default App

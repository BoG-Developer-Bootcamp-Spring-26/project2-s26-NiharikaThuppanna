import { Link } from 'react-router-dom'
import homeHero from '../assets/home-hero.png'
import './Home.css'

export default function Home() {
  return (
    <div className="home-page">
      <header className="home-page__header">
        <span aria-hidden />
        <h1 className="home-page__logo">MARTA</h1>
        <Link to="/about" className="home-page__about">
          About MARTA
        </Link>
      </header>

      <div className="home-page__body">
        <aside className="home-page__routes" aria-label="Rail lines">
          <h2 className="home-page__routes-title">View routes schedule</h2>
          <ul className="home-page__route-list">
            <li className="home-page__route-item">
              <Link to="/lines/gold" className="home-page__route-link">
                Gold Line
              </Link>
            </li>
            <li className="home-page__route-item">
              <Link to="/lines/red" className="home-page__route-link">
                Red Line
              </Link>
            </li>
            <li className="home-page__route-item">
              <Link to="/lines/green" className="home-page__route-link">
                Green Line
              </Link>
            </li>
            <li className="home-page__route-item">
              <Link to="/lines/blue" className="home-page__route-link">
                Blue Line
              </Link>
            </li>
          </ul>
        </aside>

        <div className="home-page__hero">
          <img
            className="home-page__hero-img"
            src={homeHero}
            alt="MARTA train on elevated track"
          />
        </div>
      </div>
    </div>
  )
}

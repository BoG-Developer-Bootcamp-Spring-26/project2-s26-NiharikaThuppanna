import type { LineColor, TrainArrival } from '../types/marta'
import './Train.css'

interface TrainProps {
  train: TrainArrival
  lineColor: LineColor
}

function displayPlace(raw: string | undefined): string {
  if (!raw) return 'Unknown'
  return raw
    .split('/')
    .map((seg) =>
      seg
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(' '),
    )
    .join('/')
}

function pickStr(train: TrainArrival, ...keys: string[]): string | undefined {
  const rec = train as unknown as Record<string, unknown>
  for (const k of keys) {
    const v = rec[k]
    if (typeof v === 'string' && v.length > 0) return v
  }
  return undefined
}

function normalizeLineColor(raw: string | undefined, fallback: LineColor): LineColor {
  const n = (raw ?? '').toLowerCase().trim()
  if (n === 'gold' || n === 'red' || n === 'blue' || n === 'green') {
    return n
  }
  return fallback
}

export default function Train({ train, lineColor }: TrainProps) {
  const onTime = train.DELAY === 'T0S'
  const station = displayPlace(pickStr(train, 'STATION', 'station', 'Station'))
  const destination = displayPlace(pickStr(train, 'DESTINATION', 'destination', 'Destination'))
  const eta = train.WAITING_TIME ?? train.NEXT_ARR ?? '—'

  const lineFromApi = pickStr(train, 'LINE', 'line', 'Line')
  const badgeLine = normalizeLineColor(lineFromApi, lineColor)
  const badgeLabel = (lineFromApi ?? lineColor).trim().toUpperCase()
  const badgeClass =
    badgeLine === 'gold'
      ? 'train-row__badge--gold'
      : badgeLine === 'red'
        ? 'train-row__badge--red'
        : badgeLine === 'blue'
          ? 'train-row__badge--blue'
          : 'train-row__badge--green'

  return (
    <article className="train-row">
      <div className="train-row__logo" aria-hidden>
        M
      </div>
      <div className="train-row__mid">
        <p className="train-row__route">{`${station} STATION --> ${destination}`}</p>
        <div className="train-row__meta">
          <span className={`train-row__badge ${badgeClass}`} data-line={badgeLine}>
            {badgeLabel}
          </span>
          <span className={`train-row__status ${onTime ? 'train-row__status--ontime' : 'train-row__status--delayed'}`}>
            {onTime ? 'On Time' : 'Delayed'}
          </span>
        </div>
      </div>
      <div className="train-row__eta">{eta}</div>
    </article>
  )
}

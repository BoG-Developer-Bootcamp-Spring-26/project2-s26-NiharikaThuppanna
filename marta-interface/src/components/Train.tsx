import type { TrainArrival } from '../types/marta'

interface TrainProps {
  train: TrainArrival
}

export default function Train({ train }: TrainProps) {
  const status = train.DELAY === 'T0S' ? 'On Time' : 'Delayed'

  return (
    <article style={{ border: '1px solid #d1d5db', borderRadius: '8px', padding: '10px' }}>
      <p>
        <strong>Destination:</strong> {train.DESTINATION ?? 'Unknown'}
      </p>
      <p>
        <strong>Station:</strong> {train.STATION ?? 'Unknown'}
      </p>
      <p>
        <strong>Direction:</strong> {train.DIRECTION ?? 'Unknown'}
      </p>
      <p>
        <strong>Arrival:</strong> {train.WAITING_TIME ?? train.NEXT_ARR ?? 'Unknown'}
      </p>
      <p>
        <strong>Status:</strong> {status}
      </p>
    </article>
  )
}

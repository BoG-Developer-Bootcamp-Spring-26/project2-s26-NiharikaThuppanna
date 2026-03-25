import Train from './Train'
import type { LineColor, TrainArrival } from '../types/marta'

interface TrainListProps {
  color: LineColor
  trains: TrainArrival[]
  loading: boolean
  emptyMessage?: string
}

export default function TrainList({ color, trains, loading, emptyMessage }: TrainListProps) {
  if (loading) {
    return <section>Loading trains...</section>
  }

  return (
    <section>
      <h2 style={{ textTransform: 'capitalize' }}>{color} Line Trains</h2>
      {trains.length === 0 ? (
        <p>{emptyMessage ?? 'No trains available right now.'}</p>
      ) : (
        <div style={{ display: 'grid', gap: '10px' }}>
          {trains.map((train, index) => (
            <Train key={`${train.TRAIN_ID ?? 'train'}-${index}`} train={train} />
          ))}
        </div>
      )}
    </section>
  )
}

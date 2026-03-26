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
    return <div className="lines-main__list-loading">Loading trains…</div>
  }

  if (trains.length === 0) {
    return <p className="lines-main__list-empty">{emptyMessage ?? 'No trains available right now.'}</p>
  }

  return (
    <div className="lines-main__list">
      {trains.map((train, index) => (
        <Train key={`${train.TRAIN_ID ?? 'train'}-${index}`} train={train} lineColor={color} />
      ))}
    </div>
  )
}

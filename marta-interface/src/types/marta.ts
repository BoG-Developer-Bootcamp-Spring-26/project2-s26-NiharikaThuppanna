export type LineColor = 'gold' | 'red' | 'green' | 'blue'

export interface TrainArrival {
  DESTINATION?: string
  DIRECTION?: string
  DELAY?: string
  LINE?: string
  NEXT_ARR?: string
  STATION?: string
  TRAIN_ID?: string
  WAITING_SECONDS?: string
  WAITING_TIME?: string
}

export interface StationRecord {
  STATION?: string
  [key: string]: string | number | undefined
}

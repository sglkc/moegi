export interface WindowDPIP extends Window {
  documentPictureInPicture?: DocumentPictureInPicture
  proxy?: { message: string }
}

interface DocumentPictureInPictureEvent {
  currentTarget: DocumentPictureInPicture
}

interface DocumentPictureInPictureEventMap {
  'enter': DocumentPictureInPictureEvent
}

export interface DocumentPictureInPicture {
  window?: WindowDPIP
  onenter: ((this: DocumentPictureInPicture, ev: DocumentPictureInPictureEvent) => void) | null
  addEventListener<T extends keyof DocumentPictureInPictureEventMap>(
    type: T,
    listener: (event: DocumentPictureInPictureEventMap[T]) => void,
    options?: boolean | AddEventListenerOptions
  ): void
  removeEventListener<T extends keyof DocumentPictureInPictureEventMap>(
    type: T,
    listener: (event: DocumentPictureInPictureEventMap[T]) => void,
    options?: boolean | EventListenerOptions
  ): void
}


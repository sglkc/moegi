import { MoegiOptions } from '../services/options'

export type HistoryChangeEvent = CustomEvent<Parameters<History['pushState']>>
export type HistoryEvents = HistoryChangeEvent | CustomEvent<PopStateEvent>

declare global {
  interface WindowEventMap {
    'changestate': CustomEvent<Parameters<History['pushState']>>
    'popstate': CustomEvent<PopStateEvent>
  }
  interface Window {
    __moegiOptions: MoegiOptions
  }
}

import { MoegiOptions } from '../services/options'

declare global {
  interface Window {
    __moegiOptions: MoegiOptions
  }
}

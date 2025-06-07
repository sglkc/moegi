import { defineExtensionMessaging } from '@webext-core/messaging'
import { defineCustomEventMessaging } from '@webext-core/messaging/page'

export interface ToastMessage {
  text: string
  duration?: number
}

export interface TranslateMessage {
  title?: string
  text: string
  from?: string
  to: string
}

interface ProtocolMap {
  createToast(data: ToastMessage): number
  destroyToast(id: number): boolean
  applyOptions(data: MoegiOptions): void
  translate(data: TranslateMessage): string
}

export const Background = defineExtensionMessaging<ProtocolMap>()

export const Content = defineCustomEventMessaging<ProtocolMap>({
  namespace: 'content-messenger'
})

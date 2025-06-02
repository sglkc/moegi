import { defineExtensionMessaging } from '@webext-core/messaging'
import { defineCustomEventMessaging } from '@webext-core/messaging/page'

export interface ToastMessage {
  text: string
  duration?: number
}

interface ProtocolMap {
  createToast(data: ToastMessage): number
  destroyToast(id: number): boolean
}

export const Background = defineExtensionMessaging<ProtocolMap>()

export const Content = defineCustomEventMessaging<ProtocolMap>({
  namespace: 'content-messenger'
})

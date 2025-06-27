import { defineExtensionMessaging } from '@webext-core/messaging'
import { defineCustomEventMessaging } from '@webext-core/messaging/page'
import { MoegiOptions, TranslationOptions } from './options'
import { DeepKeys } from './deep-keys'

export interface ToastMessage {
  text: string
  duration?: number
}

export interface TranslateMessage {
  title?: string
  text: string
  from?: string
  to: string
  provider?: TranslationOptions['provider']
}

export interface OptionsMessage {
  changes: DeepKeys<MoegiOptions>[]
  options: MoegiOptions
}

interface ProtocolMap {
  createToast(data: ToastMessage): number
  destroyToast(id: number): boolean
  applyOptions(data: OptionsMessage): void
  translate(data: TranslateMessage): string
}

export const Background = defineExtensionMessaging<ProtocolMap>()

export const Content = defineCustomEventMessaging<ProtocolMap>({
  namespace: 'content-messenger'
})

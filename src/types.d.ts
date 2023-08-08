import { googleTranslateApi } from 'google-translate-api-x'
import { MoegiOptions } from '../services/options'

export type HistoryChangeEvent = CustomEvent<Parameters<History['pushState']>>
export type HistoryEvents = HistoryChangeEvent | CustomEvent<PopStateEvent>

declare global {
  interface WindowEventMap {
    'changestate': CustomEvent<Parameters<History['pushState']>>
    'popstate': CustomEvent<PopStateEvent>
    'moegioptions': CustomEvent<Partial<MoegiOptions>>
    'lyricsready': CustomEvent
  }
  interface Window {
    __moegiOptions: MoegiOptions
  }
}

export type TranslationLanguage = keyof typeof googleTranslateApi.languages

declare module 'google-translate-api-x' {
  export const languages: {
    readonly [lang in TranslationLanguage]: `${(TranslationLanguage[lang])}`
  }
}

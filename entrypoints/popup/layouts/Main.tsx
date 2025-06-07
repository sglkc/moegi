import { PropsWithChildren } from 'preact/compat'
import moegiText from '@/assets/moegi-text.svg'

export default function Main({ children }: PropsWithChildren) {
  return (
    <main class="p-4 min-w-72 bg-background color-text text-sm font-text fw-500">
      <div class="mb-4 flex justify-between items-center">
        <img class="max-h-8" src={moegiText} alt="もえぎ" />
        <p class="max-w-32 line-height-4 text-end">
          <small class="text-xs">Spotify lyrics utility extension</small>
        </p>
      </div>
      { children }
    </main>
  )
}

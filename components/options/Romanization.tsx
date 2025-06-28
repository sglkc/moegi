import { DeepSignal } from 'deepsignal'
import Accordion from '@/components/Accordion'
import Checkbox from '@/components/Checkbox'
import Container from '@/components/Container'
import Input from '@/components/Input'
import Select from '@/components/Select'
import Slider from '@/components/Slider'
import { RomanizationOptions } from '@/utils/options'

interface RomanizationOptionsProps {
  signal: DeepSignal<RomanizationOptions>
}

export default function RomanizationOption({ signal }: RomanizationOptionsProps) {
  return (
    <Container label="Romanization" signal={signal}>
      <Slider
        label="Font Size"
        signal={signal.$size}
        prefix="em"
        min={0.5}
        step={0.05}
        max={2.5}
      />

      {/* Japanese options */}
      <Accordion title="Japanese">
        <Select<RomanizationOptions['japanese']['to']>
          label="To"
          signal={signal.japanese.$to}
          options={[
            { text: 'Romaji', value: 'romaji' },
            { text: 'Hiragana', value: 'hiragana' },
            { text: 'Katakana', value: 'katakana' },
          ]}
        />

        <Select<RomanizationOptions['japanese']['mode']>
          label="Mode"
          signal={signal.japanese.$mode}
          options={[
            { text: 'Normal', value: 'normal' },
            { text: 'Spaced', value: 'spaced' },
            { text: 'Okurigana', value: 'okurigana' },
            { text: 'Furigana', value: 'furigana' },
          ]}
        />

        <Select<RomanizationOptions['japanese']['system']>
          label="Romaji System"
          signal={signal.japanese.$system}
          options={[
            { text: 'Hepburn', value: 'hepburn' },
            { text: 'Nippon', value: 'nippon' },
            { text: 'Passport', value: 'passport' },
          ]}
        />

        {/* Okurigana delimiter inputs - only show when mode is okurigana */}
        {signal.japanese.mode === 'okurigana' && (
          <div class="grid grid-cols-2 gap-2">
            <div class="col-span-2 text-center font-bold">Okurigana Delimiter</div>
            <Input
              label="Start"
              signal={signal.japanese.$okuStart}
              placeholder="("
            />
            <Input
              label="End"
              signal={signal.japanese.$okuEnd}
              placeholder=")"
            />
          </div>
        )}
      </Accordion>

      <Accordion title="Korean">
        <Select<RomanizationOptions['korean']['system']>
          label="Hangul System"
          signal={signal.korean.$system}
          options={[
            { text: 'Revised', value: 'RR' },
            { text: 'McCune', value: 'MR' },
            { text: 'Yale', value: 'YL' },
          ]}
        />
      </Accordion>

       <Accordion title="Chinese">
        <Checkbox signal={signal.chinese.$ruby} mirror>
          Ruby Text:
        </Checkbox>
      </Accordion>

       <Accordion title="Cyrillic">
        <Select<RomanizationOptions['cyrillic']['lang']>
          label="Language"
          signal={signal.cyrillic.$lang}
          options={[
            { text: 'Russian', value: 'ru' },
            { text: 'Ukrainian', value: 'uk' },
          ]}
        />
      </Accordion>
    </Container>
  )
}

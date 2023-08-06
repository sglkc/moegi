import { JSX, TargetedEvent } from 'preact/compat'
import { moegiOptions } from '@/services/options'
import Checkbox from './components/Checkbox'
import Input from './components/Input'
import Select, { SelectProps } from './components/Select'
import { formInputHandler, resetStorageHandler } from './handler'
import { languages } from 'google-translate-api-x';

type FormEventHandler = JSX.EventHandler<TargetedEvent<HTMLFormElement, Event>>

export default function Popup() {
  const translationLanguages = Object.entries(languages)
    .map(([value, text]) => ({ text, value }))

  const selects: SelectProps[] = [
    {
      label: 'To',
      name: 'to',
      options: [
        { text: 'Romaji', value: 'romaji' },
        { text: 'Hiragana', value: 'hiragana' },
        { text: 'Katakana', value: 'katakana' },
      ]
    },
    {
      label: 'Mode',
      name: 'mode',
      options: [
        { text: 'Normal', value: 'normal' },
        { text: 'Spaced', value: 'spaced' },
        { text: 'Okurigana', value: 'okurigana' },
        { text: 'Furigana', value: 'furigana' },
      ]
    },
    {
      label: 'Romaji System',
      name: 'romajiSystem',
      options: [
        { text: 'Hepburn', value: 'hepburn' },
        { text: 'Nippon', value: 'nippon' },
        { text: 'Passport', value: 'passport' },
      ],
      disabled: (moegiOptions.value.to !== 'romaji')
    }
  ]

  return (
    <main class="p-4 min-w-64 text-sm">
      <form
        id="form"
        class="flex flex-col gap-2"
        onInput={formInputHandler as FormEventHandler}
      >

        <h1 class="mb-4 font-bold text-2xl text-center">Moegi</h1>

        <div class="flex flex-col gap-2">
          <Checkbox name="translation">
            <strong>Translation</strong>
          </Checkbox>


          <Checkbox name="romanization">
            <strong>Japanese Romanization</strong>
          </Checkbox>

          <Checkbox name="hideOriginal">Hide Original Lyrics</Checkbox>
        </div>

        { moegiOptions.value.translation &&
          <>
            <hr class="my-2" />
            <p><strong>Translation Options:</strong></p>
            <div class="grid gap-2">
              <Select
                label="Language Target"
                name="languageTarget"
                options={translationLanguages}
              />
            </div>
          </>
        }
        { moegiOptions.value.romanization &&
          <>
            <hr class="my-2" />
            <p><strong>Romanization Options:</strong></p>
            <div class="grid grid-cols-2 gap-2">

              { selects.map((select) => (<Select {...select} />)) }

              <div class="col-span-2 grid grid-cols-4 gap-2">
                <p class="col-span-4 text-center">Okurigana Delimiter</p>
                <Input
                  label="Start"
                  name="delimiter_start"
                  placeholder="("
                  disabled={moegiOptions.value.mode !== 'okurigana'}
                />
                <Input
                  label="End"
                  name="delimiter_end"
                  placeholder=")"
                  disabled={moegiOptions.value.mode !== 'okurigana'}
                />
              </div>
            </div>
          </>
        }

        <button
          id="reset"
          class="mt-2 p-2"
          type="button"
          onClick={resetStorageHandler}
        >
          Reset to defaults
        </button>
      </form>
    </main>
  )
}

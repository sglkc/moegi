import { JSX, TargetedEvent } from 'preact/compat'
import { languages } from 'google-translate-api-x'
import { moegiOptions } from '@/services/options'
import Checkbox from './components/Checkbox'
import Color from './components/Color'
import Input from './components/Input'
import Range from './components/Range'
import Select, { SelectProps } from './components/Select'
import { formInputHandler, resetStorageHandler } from './handler'

type FormEventHandler = JSX.EventHandler<TargetedEvent<HTMLFormElement, Event>>

export default function Form() {
  const translationLanguages = Object.entries(languages)
    .map(([code, name]) => ({
      text: `${name} (${code})`,
      value: code
    }))

  const selects: SelectProps[] = [
    {
      label: 'Romanization',
      name: 'romanization_lang',
      options: [
        { text: 'Japanese', value: 'japanese' },
        { text: 'Korean', value: 'korean' },
        { text: 'Cyrillic', value: 'cyrillic' },
        { text: 'Chinese', value: 'chinese' },
        { text: 'Anything else', value: 'any' },
      ]
    },
    {
      label: 'Language',
      name: 'cyrillic_lang',
      options: [
        { text: 'Russian', value: 'ru' },
        { text: 'Ukrainian', value: 'uk' },
      ],
      hidden: (moegiOptions.value.romanization_lang !== 'cyrillic')
    },
    {
      label: 'Hangul System',
      name: 'hangul_system',
      options: [
        { text: 'Revised', value: 'RR' },
        { text: 'McCune', value: 'MR' },
        { text: 'Yale', value: 'YL' },
      ],
      hidden: (moegiOptions.value.romanization_lang !== 'korean')
    },
    {
      label: 'To',
      name: 'to',
      options: [
        { text: 'Romaji', value: 'romaji' },
        { text: 'Hiragana', value: 'hiragana' },
        { text: 'Katakana', value: 'katakana' },
      ],
      hidden: (moegiOptions.value.romanization_lang !== 'japanese')
    },
    {
      label: 'Mode',
      name: 'mode',
      options: [
        { text: 'Normal', value: 'normal' },
        { text: 'Spaced', value: 'spaced' },
        { text: 'Okurigana', value: 'okurigana' },
        { text: 'Furigana', value: 'furigana' },
      ],
      hidden: (moegiOptions.value.romanization_lang !== 'japanese')
    },
    {
      label: 'Romaji System',
      name: 'romajiSystem',
      options: [
        { text: 'Hepburn', value: 'hepburn' },
        { text: 'Nippon', value: 'nippon' },
        { text: 'Passport', value: 'passport' },
      ],
      hidden: (moegiOptions.value.romanization_lang !== 'japanese'),
      disabled: (moegiOptions.value.to !== 'romaji')
    }
  ]

  return (
    <form
      id="form"
      class="flex flex-col gap-2"
      onInput={formInputHandler as FormEventHandler}
    >
      <div class="flex flex-col gap-2">
        <Checkbox name="styling">
          <strong>Lyrics Styling</strong>
        </Checkbox>

        <Checkbox name="translation">
          <strong>Translation</strong>
        </Checkbox>

        <Checkbox name="romanization">
          <strong>Romanization</strong>
        </Checkbox>

        {(moegiOptions.value.translation || moegiOptions.value.romanization) &&
          <Checkbox name="hideOriginal">Hide Original Lyrics</Checkbox>
        }
      </div>

      { moegiOptions.value.styling &&
        <>
          <hr class="my-2" />
          <p><strong>Lyrics Style:</strong></p>
          <div class="grid grid-cols-2 gap-x-4 gap-y-2">
            <Select
              label="Text Align"
              name="lyrics_align"
              options={[
                { text: 'Left', value: 'left' },
                { text: 'Center', value: 'center' },
                { text: 'Right', value: 'Right' }
              ]}
            />
            <div class="col-span-2">
              <Range
                label="Font Size"
                name="lyrics_size"
                prefix="em"
                min="0.5"
                step="0.05"
                max="2.5"
              />
            </div>
            <div class="col-span-2">
              <Range
                label="Spacing"
                name="lyrics_spacing"
                prefix="px"
                max="64"
              />
            </div>
            <Color />
          </div>
        </>
      }
      { moegiOptions.value.translation &&
        <>
          <hr class="my-2" />
          <p><strong>Translation Options:</strong></p>
          <div class="grid gap-2">
            <Range
              label="Font Size"
              name="translation_size"
              prefix="em"
              min="0.5"
              step="0.05"
              max="1.5"
            />
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
            <div class="col-span-2">
              <Range
                label="Font Size"
                name="romanization_size"
                prefix="em"
                min="0.5"
                step="0.05"
                max="1.5"
              />
            </div>

            { selects.map((select) => (<Select {...select} />)) }

            { (moegiOptions.value.romanization_lang === 'chinese') &&
              <Checkbox name="chinese_ruby">
                <strong>Ruby text</strong>
              </Checkbox>
            }

            { ((moegiOptions.value.romanization_lang === 'japanese') &&
                moegiOptions.value.mode === 'okurigana')
              &&
              <div class="col-span-2 grid grid-cols-4 gap-2">
                <p class="col-span-4 text-center">Okurigana Delimiter</p>
                <Input
                  label="Start"
                  name="delimiter_start"
                  placeholder="("
                />
                <Input
                  label="End"
                  name="delimiter_end"
                  placeholder=")"
                />
              </div>
            }
          </div>
        </>
      }

      <button
        id="reset"
        class="mt-2 p-2 bg-accent color-light text-bold rounded"
        type="button"
        onClick={resetStorageHandler}
      >
        Reset to defaults
      </button>
    </form>
  )
}

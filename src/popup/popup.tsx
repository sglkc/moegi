import Checkbox from './components/Checkbox'
import Input from './components/Input'
import Select, { SelectProps } from './components/Select'

export default function Popup() {
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
      label: 'Romaji System:',
      name: 'romajiSystem',
      options: [
        { text: 'Hepburn', value: 'hepburn' },
        { text: 'Nippon', value: 'nippon' },
        { text: 'Passport', value: 'passport' },
      ]
    }
  ]

  return (
    <main class="p-4 pb-6 min-w-64 text-sm">
      <form id="form" class="flex flex-col items-center gap-2">
        <h1 class="font-bold text-2xl">Moegi</h1>

        <Checkbox name="active">
          Extension is currently <strong id="status">OFF</strong>
        </Checkbox>

        <p><strong>Options:</strong></p>
        <div class="grid grid-cols-2 gap-2">

          { selects.map((select) => (<Select {...select} />)) }

          <div class="col-span-2 grid grid-cols-4 gap-2">
            <p class="col-span-4 text-center">Okurigana Delimiter</p>
            <Input
              label="Start"
              name="delimiter_start"
              placeholder="("
              value="("
            />

            <Input label="End" name="delimiter_end" placeholder=")" value=")" />
          </div>

          <Checkbox name="active">Hide Original Lyrics</Checkbox>
        </div>

        <button id="reset" class="p-2" type="button">Reset to defaults</button>
      </form>
    </main>
  )
}

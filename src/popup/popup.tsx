export default function Popup() {
  return (
    <main class="p-4 pb-6 min-w-64 text-sm">
      <form id="form" class="flex flex-col items-center gap-2">
        <h1 class="font-bold text-2xl">Moegi</h1>

        <label
          class="my-1 flex justify-center gap-1 text-center cursor-pointer"
          for="active"
        >
          <input id="active" type="checkbox" name="active" />
          <span>Extension is currently <strong id="status">OFF</strong></span>
        </label>

        <p><strong>Options:</strong></p>
        <div class="grid grid-cols-2 gap-2">
          <label class="py-1 text-right" for="to">To:</label>
          <select id="to" class="bg-gray-50 disabled:bg-gray-200 p-1 b-1" name="to">
            <option value="romaji" selected>Romaji</option>
            <option value="hiragana">Hiragana</option>
            <option value="katakana">Katakana</option>
          </select>

          <label class="py-1 text-right" for="mode">Mode:</label>
          <select
            id="mode"
            class="bg-gray-50 disabled:bg-gray-200 p-1 b-1"
            name="mode"
          >
            <option value="normal">Normal</option>
            <option value="spaced" selected>Spaced</option>
            <option value="okurigana">Okurigana</option>
            <option value="furigana">Furigana</option>
          </select>

          <label class="py-1" for="romajiSystem">Romaji System:</label>
          <select
            id="romajiSystem"
            class="bg-gray-50 disabled:bg-gray-200 p-1 b-1"
            name="romajiSystem"
          >
            <option value="hepburn" selected>Hepburn</option>
            <option value="nippon">Nippon</option>
            <option value="passport">Passport</option>
          </select>

          <div class="col-span-2 grid grid-cols-4 gap-2">
            <p class="col-span-4 text-center">Okurigana Delimiter</p>
            <label class="py-1 text-center" for="delimiter_start">Start:</label>
            <input
              id="delimiter_start"
              class="bg-gray-50 disabled:bg-gray-200 p-1 b-1 px-2"
              type="text"
              name="delimiter_start"
              placeholder="("
              value="("
              />

            <label class="py-1 text-center" for="delimiter_end">End:</label>
            <input
              id="delimiter_end"
              class="bg-gray-50 disabled:bg-gray-200 p-1 b-1 px-2"
              type="text"
              name="delimiter_end"
              placeholder=")"
              value=")"
              />
          </div>

          <label
            class="my-1 flex justify-center gap-1 text-center cursor-pointer col-span-2"
            for="hideOriginal"
          >
            <input id="hideOriginal" type="checkbox" name="hideOriginal" />
            <span>Hide Original Lyrics</span>
          </label>
        </div>

        <button id="reset" class="p-2" type="button">Reset to defaults</button>
      </form>
    </main>
  )
}

import { MoegiOptions, MoegiOptionsKey } from "@/services/options";
import { options, lyricElements, scrollToActiveLyric } from "./init";
import createToast from "./toast";

type Language = MoegiOptions['romanization_lang']
type UpdateKeys = Array<MoegiOptionsKey>

export interface Romanization {
  name: string
  language: Language
  updateKeys: UpdateKeys
  check: (text: string) => boolean
  convert: (text: string, options: MoegiOptions) => Promise<string>
}

const romanizations = {
  japanese: import('./romanizations/japanese'),
  korean: import('./romanizations/korean'),
  cyrillic: import('./romanizations/cyrillic'),
  chinese: import('./romanizations/chinese'),
  any: import('./romanizations/any'),
}

// Convert lyric lines using hangul-romanization if they have any Korean characters
async function convertLyrics(romanization: Romanization) {
  let matches = false;

  for (const lyricElement of lyricElements) {
    const originalElement = lyricElement.firstElementChild!;
    const originalText = originalElement.textContent!.trim();

    if (!romanization.check(originalText)) continue;

    const convertedElement = lyricElement.querySelector('.converted-lyrics')!;
    const convertedText = await romanization.convert(originalText, options);

    convertedElement.innerHTML = convertedText;
    matches = true;
  }

  if (matches)
    createToast(`${romanization.name} romanization generated`).showToast();
}

async function applyRomanization(event: WindowEventMap['moegioptions']) {
  const language = await romanizations[options.romanization_lang].then(e => e.default)

  // Check if romanization should update or not based on updateKeys
  const updateDetail = Object.keys(event.detail ?? {}) as Array<MoegiOptionsKey>
  const shouldUpdate = updateDetail.includes('romanization_lang')
    || updateDetail.find(key => language.updateKeys.includes(key))

  if ((event.type === 'moegioptions') && !shouldUpdate) return

  // Clear past conversions to avoid duplicate elements
  document.querySelectorAll('.converted-lyrics')
    .forEach((el) => el.innerHTML = '');

  if (options.romanization) await convertLyrics(language);

  scrollToActiveLyric();
}

// Apply new options on event and on lyrics ready
addEventListener('moegioptions', applyRomanization);
addEventListener('lyricsready', applyRomanization);

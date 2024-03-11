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
  cyrillic: import('./romanizations/cyrillic')
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

    convertedElement.innerHTML = convertedText.toString();
    matches = true;
  }

  if (matches)
    createToast(`${romanization.name} romanization generated`).showToast();
}

async function applyRomanization() {
  // This used to be a check if romanization should update or not

  // Clear past conversions to avoid duplicate elements
  document.querySelectorAll('.converted-lyrics')
    .forEach((el) => el.innerHTML = '');

  if (options.romanization) {
    const language = await romanizations[options.romanization_lang].then(e => e.default)
    await convertLyrics(language);
  }

  scrollToActiveLyric();
}

// Apply new options on event and on lyrics ready
addEventListener('moegioptions', applyRomanization);
addEventListener('lyricsready', applyRomanization);

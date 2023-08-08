import { MoegiOptionsKey } from '@/services/options';
import { options } from './init';

// Style element for elements styling
const generateStyles = () => `
  [data-testid="fullscreen-lyric"] {
    margin-top: ${options.lyrics_spacing}px;
    font-size: ${options.lyrics_size}em;
    text-align: '${options.lyrics_align}';
  }
  .converted-lyrics { font-size: ${options.romanization_size}em; }
  .translated-lyrics { font-size: ${options.translation_size}em; }
`.trim();

const styleElement = document.createElement('style');

styleElement.innerHTML = generateStyles();
document.head.append(styleElement);

// Lyrics colors styling
const defaultColors = new Map();
const colorProperties = ['active', 'inactive', 'passed', 'background'] as const;
let lyricsStyles: CSSStyleDeclaration;

function styleLyrics() {
  colorProperties.forEach((prop) => {
    const property = `--lyrics-color-${prop}`;
    const option: MoegiOptionsKey = `lyrics_${prop}`;
    const newValue = options[option] || defaultColors.get(prop);

    lyricsStyles.setProperty(property, newValue);
  });
}

function applyStyle(e: Event) {
  lyricsStyles = document.querySelector<HTMLDivElement>('[style*="lyrics"]')!.style;

  // If lyrics ready, set current style to default style
  if (e.type === 'lyricsready') {
    colorProperties.forEach((prop) => {
      const property = `--lyrics-color-${prop}`;
      defaultColors.set(prop, lyricsStyles.getPropertyValue(property));
    });
  }

  styleElement.innerHTML = generateStyles();

  // If styling is active, continue to style element, else set to defaults
  if (options.styling) return styleLyrics();

  colorProperties.forEach((prop) => {
    const property = `--lyrics-color-${prop}`;
    lyricsStyles.setProperty(property, defaultColors.get(prop))
  });
}

// Apply new options on event and on lyrics ready
addEventListener('moegioptions', applyStyle);
addEventListener('lyricsready', applyStyle);

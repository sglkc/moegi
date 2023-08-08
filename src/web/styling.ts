import { MoegiOptionsKey } from '@/services/options';
import { options } from './init';

const defaultStyle = new Map();
const styleProperties = ['active', 'inactive', 'passed', 'background'] as const;
let styles: CSSStyleDeclaration;

function styleLyrics() {
  styleProperties.forEach((prop) => {
    const property = `--lyrics-color-${prop}`;
    const option: MoegiOptionsKey = `lyrics_${prop}`;
    const newValue = options[option] || defaultStyle.get(prop);

    styles.setProperty(property, newValue);
  });
}

function applyStyle(e: Event) {
  styles = document.querySelector<HTMLDivElement>('[style*="lyrics"]')!.style;

  // If lyrics ready, set current style to default style
  if (e.type === 'lyricsready') {
    styleProperties.forEach((prop) => {
      const property = `--lyrics-color-${prop}`;
      defaultStyle.set(prop, styles.getPropertyValue(property));
    });
  }

  // If styling is active, continue to style element, else set to defaults
  if (options.styling) return styleLyrics();

  styleProperties.forEach((prop) => {
    const property = `--lyrics-color-${prop}`;
    styles.setProperty(property, defaultStyle.get(prop))
  });
}

// Apply new options on event and on lyrics ready
addEventListener('moegioptions', applyStyle);
addEventListener('lyricsready', applyStyle);

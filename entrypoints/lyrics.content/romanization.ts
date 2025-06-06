import anyAscii from 'any-ascii'

export default function romanize(text: string): string {
  return anyAscii(text)
}

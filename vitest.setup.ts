import { vi } from 'vitest'

// Extension APIs used by romanization providers (e.g. japanese dict URL)
vi.stubGlobal('chrome', {
  runtime: {
    id: 'moegi-test',
    getURL: (path: string) => `chrome-extension://moegi-test${path.startsWith('/') ? path : `/${path}`}`,
    sendMessage: vi.fn(),
  },
})

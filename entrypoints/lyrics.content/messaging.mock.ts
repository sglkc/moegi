import { vi } from 'vitest'

/**
 * Shared messaging mocks for feature tests.
 * Import this module before feature modules that use @/utils/messaging.
 */
const mocks = vi.hoisted(() => {
  const contentSendMessage = vi.fn(
    async (type: string, _data?: unknown): Promise<unknown> => {
      if (type === 'createToast') return 1
      if (type === 'destroyToast') return true
      return undefined
    },
  )

  const backgroundSendMessage = vi.fn(
    async (type: string, _data?: unknown): Promise<unknown> => {
      if (type === 'translate') return ''
      return undefined
    },
  )

  function resetMessagingMocks() {
    contentSendMessage.mockClear()
    backgroundSendMessage.mockClear()
    contentSendMessage.mockImplementation(async (type: string) => {
      if (type === 'createToast') return 1
      if (type === 'destroyToast') return true
      return undefined
    })
    backgroundSendMessage.mockImplementation(async (type: string) => {
      if (type === 'translate') return ''
      return undefined
    })
  }

  return { contentSendMessage, backgroundSendMessage, resetMessagingMocks }
})

export const contentSendMessage = mocks.contentSendMessage
export const backgroundSendMessage = mocks.backgroundSendMessage
export const resetMessagingMocks = mocks.resetMessagingMocks

vi.mock('@/utils/messaging', () => ({
  Content: {
    sendMessage: mocks.contentSendMessage,
    onMessage: vi.fn(),
  },
  Background: {
    sendMessage: mocks.backgroundSendMessage,
    onMessage: vi.fn(),
  },
}))

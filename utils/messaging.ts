import { defineExtensionMessaging } from '@webext-core/messaging';

interface ProtocolMap {
  sendToast(data: string): void;
}

export const { sendMessage, onMessage } = defineExtensionMessaging<ProtocolMap>();

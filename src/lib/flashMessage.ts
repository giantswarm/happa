import { FlashMessagesController } from 'UI/Util/FlashMessages/FlashMessagesController';

/**
 * Message severity.
 */
export const messageType = {
  ERROR: 'error',
  INFO: 'info',
  SUCCESS: 'success',
  WARNING: 'warning',
};

/**
 * Duration of a message.
 */
export const messageTTL = {
  FOREVER: false as const,
  SHORT: 1500,
  MEDIUM: 3000,
  LONG: 10000,
  VERYLONG: 30000,
};

export class FlashMessage {
  constructor(
    text: React.ReactNode,
    type: PropertiesOf<typeof messageType>,
    ttl?: number | false,
    subtext?: React.ReactNode,
    onClose?: () => void
  ) {
    FlashMessagesController.getInstance().enqueue({
      title: text,
      ttl: ttl ?? false,
      type,
      message: subtext,
      onClose,
    });
  }
}

/**
 * Remove all queued messages and close those that are displayed.
 */
export function clearQueues() {
  FlashMessagesController.getInstance().clear();
}

/**
 * Remove all messages from all queues without waiting for the animation
 * to finish.
 */
export function forceRemoveAll() {
  clearQueues();
}

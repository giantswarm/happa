import QueueImpl from 'lib/Queue';
import Noty from 'noty';
import { PropertiesOf } from 'shared/types';

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
  /**
   * The messages waiting to be displayed.
   */
  public static queue = new QueueImpl();

  public static hashQueueItem(
    type: PropertiesOf<typeof messageType>,
    text: string
  ) {
    return `${type}:${text}`;
  }

  private readonly noty: Noty;
  private readonly text: string;
  private readonly timeout: number | false = false;

  constructor(
    text: string,
    type: PropertiesOf<typeof messageType>,
    ttl?: number | false,
    subtext?: string,
    onClose?: () => void
  ) {
    const hash = FlashMessage.hashQueueItem(type, text);

    // make sure to only pass escaped HTML to this.text!
    this.text = `<p>${escapeHTML(text)}</p>`;
    if (subtext) {
      this.text += `<p>${escapeHTML(subtext)}</p>`;
    }

    if (ttl) {
      this.timeout = ttl;
    }

    this.noty = new Noty({
      type: type as Noty.Type,
      text: this.text,
      timeout: this.timeout,
      callbacks: {
        beforeShow: this.onBeforeShow(hash),
        afterClose: this.onAfterClose(hash),
        onClose,
      },
      theme: 'bootstrap-v3',
      layout: 'topRight',
      closeWith: ['click', 'button'],
      animation: {
        close: 'flash_message_close',
      },
    });

    if (!FlashMessage.queue.includes(hash)) {
      this.noty.show();
    }
  }

  onBeforeShow = (hash: string) => () => {
    FlashMessage.queue.add(hash);
  };

  onAfterClose = (hash: string) => () => {
    FlashMessage.queue.remove(hash);
  };
}

/**
 * Remove all queued messages and close those that are displayed.
 */
export function clearQueues() {
  Noty.closeAll();
  FlashMessage.queue.clear();
}

/**
 * Remove all messages from the given queue and close the displayed ones.
 */
export function clearQueue(queueName: string) {
  Noty.closeAll(queueName);
  FlashMessage.queue.clear();
}

/**
 * Remove all messages from all queues without waiting for the animation
 * to finish.
 */
export function forceRemoveAll() {
  clearQueues();

  const notificationWrapper = document.querySelector('.noty_layout');
  notificationWrapper?.remove();
}

/**
 * Escapes HTML in a notification text.
 *
 * The following tag can be used (in lowercase only, without attributes):
 *
 *   <code>...</code>
 *
 * @param unsafe - Input HTML code.
 */
function escapeHTML(unsafe: string): string {
  let safe = unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
  safe = safe
    .replace(/&lt;code&gt;/g, '<code>')
    .replace(/&lt;\/code&gt;/g, '</code>');

  return safe;
}

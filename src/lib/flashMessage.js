import QueueImpl from 'lib/Queue';
import Noty from 'noty';

// messageType affects the visual markup to distinguish severity
export const messageType = {
  ERROR: 'error',
  INFO: 'info',
  SUCCESS: 'success',
  WARNING: 'warning',
};

// Display duration for a message.
// bool false means forever.
// integers are a duration in milliseconds.
export const messageTTL = {
  FOREVER: false,
  SHORT: 1500,
  MEDIUM: 3000,
  LONG: 10000,
  VERYLONG: 30000,
};

export class FlashMessage {
  /**
   * The messages waiting to be displayed.
   * @type {IQueue<string>}
   */
  static queue = new QueueImpl();

  static hashQueueItem(type, text) {
    return `${type}:${text}`;
  }

  constructor(text, type, ttl, subtext, onClose) {
    const hash = FlashMessage.hashQueueItem(type, text);

    // make sure to only pass escaped HTML to this.text!
    this.text = `<p>${escapeHTML(text)}</p>`;
    if (subtext) {
      this.text += `<p>${escapeHTML(subtext)}</p>`;
    }

    this.timeout = false;
    if (ttl) {
      this.timeout = ttl;
    }

    this.noty = new Noty({
      type: type,
      text: this.text,
      timeout: this.timeout,
      callbacks: {
        beforeShow: this.onBeforeShow(hash),
        afterClose: this.onAfterClose(hash),
        onClose,
      },
      theme: 'bootstrap-v3',
      layout: 'topRight',
      visibilityControl: true,
      closeWith: ['click', 'button'],
      animation: {
        close: 'flash_message_close',
      },
    });

    if (!FlashMessage.queue.includes(hash)) {
      this.noty.show();
    }
  }

  onBeforeShow = (hash) => () => {
    FlashMessage.queue.add(hash);
  };

  onAfterClose = (hash) => () => {
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
export function clearQueue(queueName) {
  Noty.closeAll(queueName);
  FlashMessage.queue.clear();
}

/**
 * Remove all messages from all queues without waiting for the animation
 * to finish
 */
export function forceRemoveAll() {
  clearQueues();

  const notificationWrapper = document.querySelector('.noty_layout');
  // eslint-disable-next-line no-unused-expressions
  notificationWrapper?.remove();
}

/**
 * Escapes HTML in a notification text.
 *
 * The following tag can be used (in lowercase only, without attributes):
 *
 *   <code>...</code>
 *
 * @param {string} unsafe
 * @returns {string}
 */
function escapeHTML(unsafe) {
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

'use strict';

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
  constructor(text, type, ttl, subtext) {
    // make sure to only pass escaped HTML to this.text!
    this.text = '<p>' + escapeHTML(text) + '</p>';
    if (subtext) {
      this.text += '<p>' + escapeHTML(subtext) + '</p>';
    }

    this.timeout = false;
    if (ttl) {
      this.timeout = ttl;
    }

    this.noty = new Noty({
      type: type,
      text: this.text,
      timeout: this.timeout,
      theme: 'bootstrap-v3',
      layout: 'topRight',
      visibilityControl: true,
      animation: {
        close: 'flash_message_close',
      },
    });

    this.noty.show();
  }
}

/**
 * Remove all queued messages and close those that are displayed.
 */
export function clearQueues() {
  Noty.closeAll();
}

/**
 * Remove all messages from the given queue and close the displayed ones.
 */
export function clearQueue(queueName) {
  Noty.closeAll(queueName);
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
  var safe = unsafe
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

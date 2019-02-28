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
    this.text = text;
    if (subtext) {
      this.text = '<p>' + text + '</p><p>' + subtext + '</p>';
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

// TODO: remove this as all occurrences are replaced with
// new FlashMessage()
export function flashAdd(flashMessage) {
  console.log('flashAdd called with message:', flashMessage);
  new Noty({
    type: flashMessage.class,
    text: flashMessage.message,
    timeout: flashMessage.ttl || false,
    theme: 'bootstrap-v3',
    layout: 'topRight',
    visibilityControl: true,
    animation: {
      close: 'flash_message_close',
    },
  }).show();
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

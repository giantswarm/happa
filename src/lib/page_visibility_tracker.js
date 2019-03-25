'use strict';

class PageVisibilityTracker {
  constructor() {
    // client-independent tracking of visibility change
    if (typeof document.hidden !== 'undefined') {
      // Opera 12.10 and Firefox 18 and later support
      this.hidden = 'hidden';
      this.visibilityChange = 'visibilitychange';
    } else if (typeof document.msHidden !== 'undefined') {
      this.hidden = 'msHidden';
      this.visibilityChange = 'msvisibilitychange';
    } else if (typeof document.webkitHidden !== 'undefined') {
      this.hidden = 'webkitHidden';
      this.visibilityChange = 'webkitvisibilitychange';
    }
  }

  /**
   * Set a change handler function that will be called on every
   * change of the page's visibility
   *
   * @param {change handler} func
   */
  addEventListener(func) {
    if (
      typeof document.addEventListener === 'undefined' ||
      this.hidden === undefined
    ) {
      console.log(
        'This piece of code requires a browser that supports the Page Visibility API.'
      );
    } else {
      // Handle page visibility change
      document.addEventListener(this.visibilityChange, func, false);
    }
  }

  /**
   * Remove the page visibility change handler
   *
   * @param {change handler} func
   */
  removeEventListener(func) {
    document.removeEventListener(this.visibilityChange, func, false);
  }

  /**
   * Return true if the page is visible
   */
  isVisible() {
    return !document[this.hidden];
  }
}

export default PageVisibilityTracker;

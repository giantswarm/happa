class PageVisibilityTracker {
  /**
   * Set a change handler function that will be called on every
   * change of the page's visibility.
   * @param fn
   */
  // eslint-disable-next-line class-methods-use-this
  public addEventListener(fn: EventListener) {
    // Handle page visibility change
    document.addEventListener('visibilitychange', fn, false);
  }

  /**
   * Remove the page visibility change handler.
   * @param fn
   */
  // eslint-disable-next-line class-methods-use-this
  public removeEventListener(fn: EventListener) {
    document.removeEventListener('visibilitychange', fn, false);
  }

  /**
   * Return true if the page is visible
   */
  // eslint-disable-next-line class-methods-use-this
  public isVisible(): boolean {
    return !document.hidden;
  }
}

export default PageVisibilityTracker;

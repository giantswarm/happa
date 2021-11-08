export interface IQueue<T> {
  add: (entry: T) => void;
  remove: (entry: T) => void;
  includes: (entry: T) => void;
  clear: () => void;
}

class QueueImpl<T> implements IQueue<T>, Iterable<T> {
  protected entries: T[] = [];

  /**
   * Get the length of the queue.
   */
  get length(): number {
    return this.entries.length;
  }

  /**
   * Implement the iterable interface, to allow looping over the queue's entries.
   */
  public [Symbol.iterator](): Iterator<T> {
    let step = -1;
    const entries = this.entries;

    const iterator: Iterator<T> = {
      next() {
        step++;

        if (step < entries.length) {
          return {
            value: entries[step],
            done: false,
          };
        }

        return {
          value: null,
          done: true,
        };
      },
    };

    return iterator;
  }

  /**
   * Add a new queue entry.
   * @param entry
   */
  public add(entry: T) {
    this.entries.push(entry);
  }

  /**
   * Remove an existing queue entry.
   * @param entry
   */
  public remove(entry: T) {
    this.entries = this.entries.filter((currentEntry) => {
      return !Object.is(currentEntry, entry);
    });
  }

  /**
   * Check whether an entry is present in the queue.
   * @param entry
   */
  public includes(entry: T) {
    return this.entries.some(
      (currentEntry) => JSON.stringify(currentEntry) === JSON.stringify(entry)
    );
  }

  /**
   * Clear the queue.
   */
  public clear() {
    this.entries = [];
  }
}

export default QueueImpl;

export interface IQueue<T> {
  add: (entry: T) => void;
  remove: (entry: T) => void;
  includes: (entry: T) => void;
  clear: () => void;
}

class QueueImpl<T> implements IQueue<T> {
  protected entries: T[] = [];

  public add(entry: T) {
    this.entries.push(entry);
  }

  public remove(entry: T) {
    this.entries = this.entries.filter((currentEntry) => {
      return !Object.is(currentEntry, entry);
    });
  }

  public includes(entry: T) {
    return this.entries.includes(entry);
  }

  public clear() {
    this.entries = [];
  }
}

export default QueueImpl;

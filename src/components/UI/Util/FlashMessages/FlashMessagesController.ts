import { messageTTL, messageType } from 'utils/flashMessage';
import QueueImpl from 'utils/Queue';

const MAX_COUNT = 25;

export interface IFlashMessageEntry {
  title: React.ReactNode;
  type: PropertiesOf<typeof messageType>;
  ttl: PropertiesOf<typeof messageTTL>;
  message?: React.ReactNode;
  onClose?: () => void;
}

export enum FlashMessageEvents {
  Enqueue = 'enqueue',
  Remove = 'remove',
  Clear = 'clear',
}

export interface IFlashMessageEventPayloads {
  [FlashMessageEvents.Enqueue]: {
    entry: IFlashMessageEntry;
    queue: IFlashMessageEntry[];
  };
  [FlashMessageEvents.Remove]: {
    entry: IFlashMessageEntry;
    queue: IFlashMessageEntry[];
  };
  [FlashMessageEvents.Clear]: { queue: IFlashMessageEntry[] };
}

export type FlashMessageEventCallbacks = {
  [key in FlashMessageEvents]: (
    event: CustomEvent<IFlashMessageEventPayloads[key]>
  ) => void;
};

interface IFlashMessageEntryTimer {
  id: number;
  duration: number;
  paused: boolean;
  startTimestamp: number;
}

export class FlashMessagesController {
  public static getInstance(): FlashMessagesController {
    if (!FlashMessagesController.instance) {
      FlashMessagesController.instance = new FlashMessagesController();
    }

    return FlashMessagesController.instance;
  }

  public enqueue(entry: IFlashMessageEntry) {
    if (this.queue.length >= MAX_COUNT || this.queue.includes(entry)) return;

    this.queue.add(entry);

    this.dispatchEvent(FlashMessageEvents.Enqueue, {
      entry,
      queue: this.queueToArray(),
    });

    this.setEntryTimer(entry);
  }

  public remove(entry: IFlashMessageEntry) {
    this.queue.remove(entry);

    this.dispatchEvent(FlashMessageEvents.Remove, {
      entry,
      queue: this.queueToArray(),
    });

    entry.onClose?.();

    this.removeEntryTimer(entry);
  }

  public clear() {
    for (const entry of this.queue) {
      this.removeEntryTimer(entry);
    }

    this.queue.clear();

    this.dispatchEvent(FlashMessageEvents.Clear, {
      queue: this.queueToArray(),
    });
  }

  public pause(entry: IFlashMessageEntry) {
    const timer = this.getEntryTimer(entry);
    if (!timer) return;

    timer.paused = true;
    // Remove elapsed time.
    timer.duration = timer.startTimestamp + timer.duration - Date.now();
    window.clearTimeout(timer.id);
  }

  public resume(entry: IFlashMessageEntry) {
    const timer = this.getEntryTimer(entry);
    if (!timer || !timer.paused) return;

    timer.paused = false;

    if (timer.duration > 0) {
      timer.startTimestamp = Date.now();
      timer.id = window.setTimeout(() => this.remove(entry), timer.duration);
    } else {
      this.remove(entry);
    }
  }

  public addEventListener<
    T extends FlashMessageEvents,
    U extends FlashMessageEventCallbacks[T]
  >(event: T, cb: U) {
    this.eventEmitter.addEventListener(event, cb as EventListener, false);
  }

  public removeEventListener<
    T extends FlashMessageEvents,
    U extends FlashMessageEventCallbacks[T]
  >(event: T, fn: U) {
    this.eventEmitter.removeEventListener(event, fn as EventListener, false);
  }

  protected dispatchEvent<
    T extends FlashMessageEvents,
    P extends IFlashMessageEventPayloads[T]
  >(type: T, payload: P) {
    const event = new CustomEvent(type, {
      detail: payload,
    });
    this.eventEmitter.dispatchEvent(event);
  }

  protected queueToArray(): IFlashMessageEntry[] {
    const arr = new Array(this.queue.length);

    let idx = arr.length - 1;
    for (const entry of this.queue) {
      arr[idx--] = entry;
    }

    return arr;
  }

  protected getEntryTimer(
    entry: IFlashMessageEntry
  ): IFlashMessageEntryTimer | undefined {
    return this.timers[JSON.stringify(entry)];
  }

  protected removeEntryTimer(entry: IFlashMessageEntry) {
    const timer = this.getEntryTimer(entry);
    if (!timer) return;

    window.clearTimeout(timer.id);

    delete this.timers[JSON.stringify(entry)];
  }

  protected setEntryTimer(entry: IFlashMessageEntry) {
    if (!entry.ttl) return;

    const id = window.setTimeout(() => this.remove(entry), entry.ttl);

    this.timers[JSON.stringify(entry)] = {
      id,
      duration: entry.ttl,
      startTimestamp: Date.now(),
      paused: false,
    };
  }

  protected queue = new QueueImpl<IFlashMessageEntry>();
  protected eventEmitter = new EventTarget();

  protected timers: Record<string, IFlashMessageEntryTimer> = {};

  private static instance: FlashMessagesController | null = null;
}

import { Layer } from 'grommet';
import React, { useCallback, useLayoutEffect, useState } from 'react';
import { TransitionGroup } from 'react-transition-group';
import SlideTransition from 'styles/transitions/SlideTransition';
import {
  FlashMessageEventCallbacks,
  FlashMessageEvents,
  FlashMessagesController,
  IFlashMessageEntry,
} from 'UI/Util/FlashMessages/FlashMessagesController';

import FlashMessagesNotification from './FlashMessagesNotification';

const MAX_COUNT_AT_ONCE = 5;

interface IFlashMessagesProviderProps {
  controller: FlashMessagesController;
  animate?: boolean;
}

const FlashMessagesProvider: React.FC<IFlashMessagesProviderProps> = ({
  controller,
  animate,
}) => {
  const [queue, setQueue] = useState<IFlashMessageEntry[]>([]);

  const setQueueValue = useCallback((q: IFlashMessageEntry[]) => {
    // Remove duplicate messages.
    const queueValue: IFlashMessageEntry[] = [];
    const uniqueEntries = new Set<string>();
    for (let i = q.length - 1; i >= 0; i--) {
      const entry = q[i];
      const hash = JSON.stringify(entry);

      if (uniqueEntries.has(hash)) continue;

      uniqueEntries.add(hash);
      queueValue.push(entry);
    }

    // Limit the amount of messages that can be shown at once.
    setQueue(queueValue.slice(0, MAX_COUNT_AT_ONCE));
  }, []);

  const onEnqueue = useCallback<
    FlashMessageEventCallbacks[FlashMessageEvents.Enqueue]
  >((e) => setQueueValue(e.detail.queue), [setQueueValue]);

  const onRemove = useCallback<
    FlashMessageEventCallbacks[FlashMessageEvents.Remove]
  >((e) => setQueueValue(e.detail.queue), [setQueueValue]);

  const onClear = useCallback<
    FlashMessageEventCallbacks[FlashMessageEvents.Clear]
  >((e) => setQueueValue(e.detail.queue), [setQueueValue]);

  useLayoutEffect(() => {
    controller.addEventListener(FlashMessageEvents.Enqueue, onEnqueue);
    controller.addEventListener(FlashMessageEvents.Remove, onRemove);
    controller.addEventListener(FlashMessageEvents.Clear, onClear);

    return () => {
      controller.removeEventListener(FlashMessageEvents.Enqueue, onEnqueue);
      controller.removeEventListener(FlashMessageEvents.Remove, onRemove);
      controller.removeEventListener(FlashMessageEvents.Clear, onClear);
    };
  }, [onEnqueue, onRemove, onClear, controller]);

  return (
    <Layer
      position='top-right'
      modal={false}
      margin={{ vertical: 'large', horizontal: 'medium' }}
      responsive={false}
      plain={true}
      role='log'
      animation='none'
    >
      {animate && (
        <TransitionGroup id='flash-messages'>
          {queue.map((entry) => (
            <SlideTransition
              key={JSON.stringify(entry)}
              appear={true}
              direction='up'
            >
              <FlashMessagesNotification
                onMouseEnter={() => controller.pause(entry)}
                onMouseLeave={() => controller.resume(entry)}
                onClose={() => controller.remove(entry)}
                title={entry.title}
                type={entry.type}
                margin={{ bottom: 'small' }}
              >
                {entry.message}
              </FlashMessagesNotification>
            </SlideTransition>
          ))}
        </TransitionGroup>
      )}

      {!animate && (
        <div id='flash-messages'>
          {queue.map((entry) => (
            <FlashMessagesNotification
              key={JSON.stringify(entry)}
              onMouseEnter={() => controller.pause(entry)}
              onMouseLeave={() => controller.resume(entry)}
              onClose={() => controller.remove(entry)}
              title={entry.title}
              type={entry.type}
              margin={{ bottom: 'small' }}
            >
              {entry.message}
            </FlashMessagesNotification>
          ))}
        </div>
      )}
    </Layer>
  );
};

FlashMessagesProvider.defaultProps = {
  animate: true,
};

export default FlashMessagesProvider;

import { Box, Collapsible, Keyboard, Text } from 'grommet';
import React, { useEffect, useRef } from 'react';

import Button from '../Button';

interface IConfirmationPromptProps
  extends Omit<React.ComponentPropsWithRef<typeof Collapsible>, 'title'> {
  title?: React.ReactNode;
  confirmButton?: React.ReactNode;
  cancelButton?: React.ReactNode;
  onConfirm?: () => void;
  onCancel?: () => void;
  contentProps?: React.ComponentPropsWithoutRef<typeof Box>;
}

const ConfirmationPrompt = React.forwardRef<
  HTMLDivElement,
  IConfirmationPromptProps
>(
  (
    {
      children,
      title,
      confirmButton,
      cancelButton,
      onConfirm,
      onCancel,
      contentProps,
      ...props
    },
    ref
  ) => {
    const wrapperRef = useRef<HTMLDivElement>(null);
    const cancelButtonRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
      /**
       * Focus a control after the confirmation is opened and
       * all the microtasks have finished running.
       *  */
      setTimeout(() => {
        if (!props.open) return;

        if (cancelButtonRef.current) {
          // Focus on the cancel button if it exists.
          const cancelButtonElement =
            cancelButtonRef.current.querySelector<HTMLButtonElement>(
              '.cancel-button'
            );
          cancelButtonElement?.focus();
        } else if (wrapperRef.current) {
          // Otherwise focus on the wrapper element.
          wrapperRef.current.focus();
        }
      });
    }, [props.open]);

    const handleConfirm = (e: React.MouseEvent<HTMLElement>) => {
      e.preventDefault();

      onConfirm?.();
    };

    const handleCancel = (
      e: React.MouseEvent<HTMLElement> | React.KeyboardEvent<HTMLElement>
    ) => {
      e.preventDefault();

      onCancel?.();
    };

    const patchedContentProps = Object.assign(
      {},
      { pad: 'medium', background: 'background-front' },
      contentProps
    );

    return (
      <Collapsible {...props} ref={ref}>
        <Keyboard onEsc={handleCancel}>
          <Box
            ref={wrapperRef}
            round='xsmall'
            tabIndex={-1}
            {...patchedContentProps}
          >
            {typeof title === 'string' ? (
              <Text weight='bold' margin={{ bottom: 'small' }}>
                {title}
              </Text>
            ) : (
              title
            )}

            {children}

            {(onConfirm || onCancel) && (
              <Box
                direction='row'
                margin={{ top: 'medium' }}
                justify='center'
                gap='small'
              >
                {onConfirm &&
                  (typeof confirmButton === 'string' ? (
                    <Button danger={true} onClick={handleConfirm}>
                      {confirmButton}
                    </Button>
                  ) : (
                    confirmButton
                  ))}

                {onCancel &&
                  (typeof cancelButton === 'string' ? (
                    <Button
                      onClick={handleCancel}
                      ref={cancelButtonRef}
                      className='cancel-button'
                    >
                      {cancelButton}
                    </Button>
                  ) : (
                    cancelButton
                  ))}
              </Box>
            )}
          </Box>
        </Keyboard>
      </Collapsible>
    );
  }
);

ConfirmationPrompt.defaultProps = {
  confirmButton: 'Confirm',
  cancelButton: 'Cancel',
};

export default ConfirmationPrompt;

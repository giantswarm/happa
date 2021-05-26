import { Box, Collapsible, Keyboard } from 'grommet';
import PropTypes from 'prop-types';
import React, { useEffect, useRef } from 'react';

import Button from '../Button';

interface IConfirmationPromptProps
  extends React.ComponentPropsWithRef<typeof Collapsible> {
  onConfirm?: () => void;
  onCancel?: () => void;
  confirmButtonText?: React.ReactNode;
  cancelButtonText?: React.ReactNode;
}

const ConfirmationPrompt = React.forwardRef<
  HTMLDivElement,
  IConfirmationPromptProps
>(
  (
    {
      children,
      onConfirm,
      onCancel,
      confirmButtonText,
      cancelButtonText,
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
          const cancelButton = cancelButtonRef.current.querySelector<HTMLDivElement>(
            '.cancel-button'
          );
          cancelButton?.focus();
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

    return (
      <Collapsible {...props} ref={ref}>
        <Keyboard onEsc={handleCancel}>
          <Box
            ref={wrapperRef}
            background='background-front'
            round='xsmall'
            pad='medium'
            tabIndex={-1}
          >
            {children}

            {(onConfirm || onCancel) && (
              <Box direction='row' margin={{ top: 'medium' }} justify='center'>
                {onConfirm && (
                  <Button bsStyle='danger' onClick={handleConfirm}>
                    {confirmButtonText}
                  </Button>
                )}

                {onCancel && (
                  <Button
                    bsStyle='default'
                    onClick={handleCancel}
                    ref={cancelButtonRef}
                    tabIndex={0}
                    className='cancel-button'
                  >
                    {cancelButtonText}
                  </Button>
                )}
              </Box>
            )}
          </Box>
        </Keyboard>
      </Collapsible>
    );
  }
);

ConfirmationPrompt.propTypes = {
  open: PropTypes.bool,
  children: PropTypes.node,
  onConfirm: PropTypes.func,
  onCancel: PropTypes.func,
  confirmButtonText: PropTypes.node,
  cancelButtonText: PropTypes.node,
};

ConfirmationPrompt.defaultProps = {
  confirmButtonText: 'Confirm',
  cancelButtonText: 'Cancel',
};

export default ConfirmationPrompt;

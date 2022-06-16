import { Box, Keyboard } from 'grommet';
import React, {
  ComponentPropsWithoutRef,
  FC,
  useEffect,
  useRef,
  useState,
} from 'react';
import styled from 'styled-components';
import Button from 'UI/Controls/Button';
import StyledDeleteButton from 'UI/Display/Cluster/ClusterLabels/DeleteLabelButton';
import { Tooltip, TooltipContainer } from 'UI/Display/Tooltip';

const DeleteLabelButtonWrapper = styled.div<{ backgroundColor?: string }>`
  display: inline-block;
  position: relative;
  width: 20px;
  height: 24px;
  line-height: 24px;
  background-color: ${({ backgroundColor }) =>
    backgroundColor ?? 'transparent'};

  a {
    line-height: 1;
    position: absolute;
    top: 5px;
    font-size: 14px;
  }
`;

const DeleteLabelTooltipInner = styled.div`
  display: flex;
  margin: 10px;
  span {
    margin-right: 10px;
  }
`;

// This is to make the "Delete this label" tooltip not appear above the label deletion tooltip
const StyledTooltip = styled(Tooltip)`
  z-index: 1069 !important;
`;

interface IDeleteLabelButtonProps
  extends ComponentPropsWithoutRef<typeof Button> {
  onDelete(): void;
  onOpen(isOpen: boolean): void;

  allowInteraction?: boolean;
  backgroundColor?: string;
}

const DeleteLabelButton: FC<
  React.PropsWithChildren<IDeleteLabelButtonProps>
> = ({ onDelete, onOpen, allowInteraction, backgroundColor, ...restProps }) => {
  const [isOpen, setIsOpen] = useState(false);

  const divElement = useRef<HTMLDivElement>(null);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);

  const close = () => {
    setIsOpen(false);
    onOpen(isOpen);
  };

  const handleDelete = (
    e: React.MouseEvent<HTMLElement> | React.KeyboardEvent<HTMLElement>
  ) => {
    e.stopPropagation();
    setIsOpen(true);
    onOpen(isOpen);
  };

  useEffect(() => {
    /**
     * Focus the cancel button after the confirmation is opened and
     * all the microtasks have finished running.
     * */
    setTimeout(() => {
      if (!isOpen || !cancelButtonRef.current) return;

      const cancelButtonElement =
        cancelButtonRef.current.querySelector<HTMLButtonElement>(
          '.cancel-button'
        );
      cancelButtonElement?.focus();
    });
  }, [isOpen]);

  return (
    <DeleteLabelButtonWrapper
      ref={divElement}
      backgroundColor={backgroundColor}
    >
      <Keyboard onSpace={handleDelete} onEnter={handleDelete}>
        <TooltipContainer
          target={divElement}
          content={<StyledTooltip>Delete this label</StyledTooltip>}
        >
          <StyledDeleteButton
            tabIndex={allowInteraction ? 0 : -1}
            onClick={handleDelete}
            {...restProps}
          />
        </TooltipContainer>
      </Keyboard>
      {isOpen && (
        <Tooltip
          id='delete-label'
          target={divElement.current ?? undefined}
          background='background-weak'
        >
          <Keyboard onEsc={close}>
            <DeleteLabelTooltipInner>
              <Box gap='small' direction='row' align='end'>
                <span>Are you sure you want to delete this label?</span>
                <Button
                  danger={true}
                  onClick={() => {
                    close();
                    onDelete();
                  }}
                >
                  Delete
                </Button>
                <Button
                  link={true}
                  onClick={close}
                  ref={cancelButtonRef}
                  className='cancel-button'
                >
                  Cancel
                </Button>
              </Box>
            </DeleteLabelTooltipInner>
          </Keyboard>
        </Tooltip>
      )}
    </DeleteLabelButtonWrapper>
  );
};

export default DeleteLabelButton;

import { Keyboard } from 'grommet';
import PropTypes from 'prop-types';
import React, {
  ComponentPropsWithoutRef,
  FC,
  useEffect,
  useRef,
  useState,
} from 'react';
import Overlay from 'react-bootstrap/lib/Overlay';
import styled from 'styled-components';
import Button from 'UI/Controls/Button';
import StyledDeleteButton from 'UI/Display/Cluster/ClusterLabels/DeleteLabelButton';
import EditValueTooltip from 'UI/Display/Cluster/ClusterLabels/EditValueTooltip';

const DeleteLabelButtonWrapper = styled.div`
  display: inline-block;
`;

const DeleteLabelTooltipInner = styled.div`
  display: flex;
  margin: 10px;
  span {
    margin-right: 10px;
  }
`;

interface IDeleteLabelButtonProps extends ComponentPropsWithoutRef<'button'> {
  onDelete(): void;
  onOpen(isOpen: boolean): void;

  allowInteraction?: boolean;
}

const DeleteLabelButton: FC<IDeleteLabelButtonProps> = ({
  onDelete,
  onOpen,
  allowInteraction,
  ...restProps
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const divElement = useRef<HTMLDivElement>(null);
  const cancelButtonRef = useRef<HTMLElement>(null);

  const close = () => {
    setIsOpen(false);
    onOpen(isOpen);
  };

  useEffect(() => {
    /**
     * Focus the cancel button after the confirmation is opened and
     * all the microtasks have finished running.
     * */
    setTimeout(() => {
      if (!isOpen || !cancelButtonRef.current) return;

      const cancelButtonElement = cancelButtonRef.current.querySelector<HTMLButtonElement>(
        '.cancel-button'
      );
      cancelButtonElement?.focus();
    });
  }, [isOpen]);

  return (
    <DeleteLabelButtonWrapper ref={divElement}>
      <StyledDeleteButton
        disabled={!allowInteraction}
        onClick={() => {
          setIsOpen(true);
          onOpen(isOpen);
        }}
        {...restProps}
      >
        &times;
      </StyledDeleteButton>
      <Overlay
        target={divElement.current as HTMLDivElement}
        placement='top'
        show={isOpen}
        shouldUpdatePosition={true}
        animation={false}
      >
        <EditValueTooltip id='delete-label'>
          <Keyboard onEsc={close}>
            <DeleteLabelTooltipInner>
              <span>Are you sure you want to delete this label?</span>
              <Button
                bsStyle='danger'
                onClick={() => {
                  close();
                  onDelete();
                }}
              >
                Delete
              </Button>
              <Button
                bsStyle='link'
                onClick={close}
                ref={cancelButtonRef}
                className='cancel-button'
              >
                Cancel
              </Button>
            </DeleteLabelTooltipInner>
          </Keyboard>
        </EditValueTooltip>
      </Overlay>
    </DeleteLabelButtonWrapper>
  );
};

DeleteLabelButton.propTypes = {
  onDelete: PropTypes.func.isRequired,
  onOpen: PropTypes.func.isRequired,

  allowInteraction: PropTypes.bool,
};

export default DeleteLabelButton;

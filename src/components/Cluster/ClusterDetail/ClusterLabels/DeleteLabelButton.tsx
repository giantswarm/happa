import PropTypes from 'prop-types';
import React, { ComponentPropsWithoutRef, FC, useRef, useState } from 'react';
import Overlay from 'react-bootstrap/lib/Overlay';
import styled from 'styled-components';
import Button from 'UI/Controls/Button';
import StyledDeleteButton from 'UI/Display/Cluster/ClusterLabels/DeleteLabelButton';
import EditValueTooltip from 'UI/Display/Cluster/ClusterLabels/EditValueTooltip';

interface IDeleteLabelButton extends ComponentPropsWithoutRef<'button'> {
  onDelete(): void;
  onOpen(isOpen: boolean): void;

  allowInteraction?: boolean;
}

const DeleteLabelButtonWrapper = styled.div`
  display: inline-block;
  margin: 0 5px 0 0;
`;

const DeleteLabelTooltipInner = styled.div`
  display: flex;
  margin: 10px;
  span {
    margin-right: 10px;
  }
`;

const DeleteLabelButton: FC<IDeleteLabelButton> = ({
  onDelete,
  onOpen,
  allowInteraction,
  ...restProps
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const divElement = useRef<HTMLDivElement>(null);

  const close = () => {
    setIsOpen(false);
    onOpen(isOpen);
  };

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
            <Button bsStyle='link' onClick={close}>
              Cancel
            </Button>
          </DeleteLabelTooltipInner>
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

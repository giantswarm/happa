import styled from '@emotion/styled';
import PropTypes from 'prop-types';
import React, { FC, useRef, useState } from 'react';
import Button from 'react-bootstrap/lib/Button';
import Overlay from 'react-bootstrap/lib/Overlay';
import StyledDeleteButton from 'UI/ClusterLabels/DeleteLabelButton';
import EditValueTooltip from 'UI/ClusterLabels/EditValueTooltip';

interface IDeleteLabelButton {
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

import React from 'react';
import BootstrapModal from 'react-bootstrap/lib/Modal';
import Button from 'UI/Controls/Button';

const GenericModal = (props) => {
  return (
    <BootstrapModal
      className={`modal ${props.className}`}
      onHide={props.onClose}
      show={props.visible}
    >
      <BootstrapModal.Header closeButton>
        <BootstrapModal.Title>{props.title}</BootstrapModal.Title>
      </BootstrapModal.Header>
      <BootstrapModal.Body aria-label={props['aria-label']}>
        {props.children}
      </BootstrapModal.Body>
      <BootstrapModal.Footer>
        {props.footer ? (
          props.footer
        ) : (
          <Button link={true} onClick={props.onClose}>
            Close
          </Button>
        )}
      </BootstrapModal.Footer>
    </BootstrapModal>
  );
};

export default GenericModal;

import BootstrapModal from 'react-bootstrap/lib/Modal';
import Button from '../../shared/button';
import PropTypes from 'prop-types';
import React from 'react';

const GenericModal = props => {
  return (
    <BootstrapModal
      className='create-key-pair-modal--success'
      show={props.visible}
      onHide={props.onClose}
    >
      <BootstrapModal.Header closeButton>
        <BootstrapModal.Title>{props.title}</BootstrapModal.Title>
      </BootstrapModal.Header>
      <BootstrapModal.Body>{props.children}</BootstrapModal.Body>
      <BootstrapModal.Footer>
        <Button bsStyle='link' onClick={close}>
          Close
        </Button>
      </BootstrapModal.Footer>
    </BootstrapModal>
  );
};

GenericModal.propTypes = {
  children: PropTypes.node,
  onClose: PropTypes.func,
  title: PropTypes.node,
  visible: PropTypes.bool,
};

export default GenericModal;

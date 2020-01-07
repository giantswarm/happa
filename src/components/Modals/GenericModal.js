import BootstrapModal from 'react-bootstrap/lib/Modal';
import Button from 'UI/Button';
import PropTypes from 'prop-types';
import React from 'react';

const GenericModal = props => {
  return (
    <BootstrapModal
      className={`modal ${  props.className}`}
      onHide={props.onClose}
      show={props.visible}
    >
      <BootstrapModal.Header closeButton>
        <BootstrapModal.Title>{props.title}</BootstrapModal.Title>
      </BootstrapModal.Header>
      <BootstrapModal.Body>{props.children}</BootstrapModal.Body>
      <BootstrapModal.Footer>
        {props.footer ? (
          props.footer
        ) : (
          <Button bsStyle='link' onClick={props.onClose}>
            Close
          </Button>
        )}
      </BootstrapModal.Footer>
    </BootstrapModal>
  );
};

GenericModal.propTypes = {
  children: PropTypes.node,
  footer: PropTypes.node,
  onClose: PropTypes.func,
  title: PropTypes.node,
  visible: PropTypes.bool,
  className: PropTypes.string,
};

export default GenericModal;

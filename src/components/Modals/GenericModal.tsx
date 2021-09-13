import React from 'react';
import BootstrapModal from 'react-bootstrap/lib/Modal';
import Button from 'UI/Controls/Button';

interface IGenericModalProps {
  title: React.ReactNode;
  onClose: () => void;
  visible?: boolean;
  footer?: React.ReactNode;
}

const GenericModal: React.FC<IGenericModalProps> = ({
  onClose,
  visible,
  title,
  footer,
  children,
  ...props
}) => {
  return (
    <BootstrapModal onHide={onClose} show={visible} {...props}>
      <BootstrapModal.Header closeButton>
        <BootstrapModal.Title>{title}</BootstrapModal.Title>
      </BootstrapModal.Header>
      <BootstrapModal.Body>{children}</BootstrapModal.Body>
      <BootstrapModal.Footer>
        {footer ? (
          footer
        ) : (
          <Button link={true} onClick={onClose}>
            Close
          </Button>
        )}
      </BootstrapModal.Footer>
    </BootstrapModal>
  );
};

export default GenericModal;

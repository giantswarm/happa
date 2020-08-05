import ReleaseSelector from 'Cluster/NewCluster/ReleaseSelector/ReleaseSelector';
import PropTypes from 'prop-types';
import React from 'react';
import BootstrapModal from 'react-bootstrap/lib/Modal';
import Button from 'UI/Button';
import StyledInput from 'UI/ClusterCreation/StyledInput';

interface IUpgradeClusterModalVersionChangerProps
  extends React.ComponentPropsWithoutRef<'div'> {
  closeModal: () => void;
  onSubmit: () => void;
  onCancel: () => void;
  onChangeRelease: (newRelease: string) => void;
  releaseVersion: string;
  isAdmin?: boolean;
}

const UpgradeClusterModalVersionChanger: React.FC<IUpgradeClusterModalVersionChangerProps> = ({
  closeModal,
  onSubmit,
  onCancel,
  onChangeRelease,
  releaseVersion,
  isAdmin,
  ...rest
}) => {
  if (!isAdmin) {
    onCancel();

    return null;
  }

  const handleOnVersionChange = (newRelease: string) => {
    onChangeRelease(newRelease);
    onSubmit();
  };

  return (
    <div {...rest}>
      <BootstrapModal.Header closeButton>
        <BootstrapModal.Title>
          Change the version you want to upgrade to
        </BootstrapModal.Title>
      </BootstrapModal.Header>
      <BootstrapModal.Body>
        <StyledInput
          inputId='release-version'
          label='Release version'
          // "breaking space" hides the hint
          hint={<>&#32;</>}
        >
          <ReleaseSelector
            selectRelease={onChangeRelease}
            selectedRelease={releaseVersion}
            collapsible={false}
          />
        </StyledInput>
      </BootstrapModal.Body>
      <BootstrapModal.Footer>
        <Button
          bsStyle='primary'
          onClick={handleOnVersionChange}
          loadingTimeout={0}
        >
          Select version
        </Button>
        <Button bsStyle='link' onClick={onCancel}>
          Cancel
        </Button>
      </BootstrapModal.Footer>
    </div>
  );
};

UpgradeClusterModalVersionChanger.propTypes = {
  closeModal: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  onChangeRelease: PropTypes.func.isRequired,
  releaseVersion: PropTypes.string.isRequired,
  isAdmin: PropTypes.bool,
};

export default UpgradeClusterModalVersionChanger;

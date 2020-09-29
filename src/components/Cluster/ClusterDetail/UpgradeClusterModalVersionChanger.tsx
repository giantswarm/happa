import ReleaseSelector from 'Cluster/NewCluster/ReleaseSelector/ReleaseSelector';
import PropTypes from 'prop-types';
import React, { useMemo } from 'react';
import BootstrapModal from 'react-bootstrap/lib/Modal';
import cmp from 'semver-compare';
import { Providers } from 'shared/constants';
import { PropertiesOf } from 'shared/types';
import { canClusterUpgrade } from 'stores/cluster/utils';
import Button from 'UI/Button';
import StyledInput from 'UI/ClusterCreation/StyledInput';

interface IUpgradeClusterModalVersionChangerProps
  extends React.ComponentPropsWithoutRef<'div'> {
  closeModal: () => void;
  onSubmit: () => void;
  onCancel: () => void;
  onChangeRelease: (newRelease: string) => void;
  releaseVersion: string;
  currentReleaseVersion: string;
  provider: PropertiesOf<typeof Providers>;
  isAdmin?: boolean;
}

const UpgradeClusterModalVersionChanger: React.FC<IUpgradeClusterModalVersionChangerProps> = ({
  closeModal,
  onSubmit,
  onCancel,
  onChangeRelease,
  releaseVersion,
  currentReleaseVersion,
  provider,
  isAdmin,
  ...rest
}) => {
  const versionFilter = useMemo(
    () => (version: string): boolean => {
      if (cmp(currentReleaseVersion, version) >= 0) return false;

      if (!canClusterUpgrade(currentReleaseVersion, version, provider))
        return false;

      return true;
    },
    [currentReleaseVersion, provider]
  );

  if (!isAdmin) {
    onCancel();

    return null;
  }

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
            autoSelectLatest={false}
            versionFilter={versionFilter}
          />
        </StyledInput>
      </BootstrapModal.Body>
      <BootstrapModal.Footer>
        <Button bsStyle='primary' onClick={onSubmit} loadingTimeout={0}>
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
  currentReleaseVersion: PropTypes.string.isRequired,
  provider: PropTypes.oneOf(Object.values(Providers)).isRequired,
  isAdmin: PropTypes.bool,
};

UpgradeClusterModalVersionChanger.defaultProps = {
  isAdmin: false,
};

export default UpgradeClusterModalVersionChanger;

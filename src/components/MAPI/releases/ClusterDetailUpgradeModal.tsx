import GenericModal from 'Modals/GenericModal';
import * as releasev1alpha1 from 'model/services/mapi/releasev1alpha1';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import Button from 'UI/Controls/Button';
import ClusterDetailUpgradeModalDisclaimer from 'UI/Display/MAPI/releases/ClusterDetailUpgradeModalDisclaimer';

enum ClusterDetailUpgradeModalPane {
  Disclaimer,
  Changelog,
}

function formatReleaseVersion(release: releasev1alpha1.IRelease) {
  // Remove leading `v`.
  return release.metadata.name.slice(1);
}

function formatModalTitle(
  pane: ClusterDetailUpgradeModalPane,
  fromRelease: releasev1alpha1.IRelease,
  toRelease: releasev1alpha1.IRelease
) {
  switch (pane) {
    case ClusterDetailUpgradeModalPane.Disclaimer:
      return `Upgrade to ${formatReleaseVersion(toRelease)}`;
    case ClusterDetailUpgradeModalPane.Changelog:
      return `Changes from ${formatReleaseVersion(
        fromRelease
      )} to ${formatReleaseVersion(toRelease)}`;
    default:
      return '';
  }
}

function formatPrimaryButtonText(pane: ClusterDetailUpgradeModalPane) {
  switch (pane) {
    case ClusterDetailUpgradeModalPane.Disclaimer:
      return 'Inspect changes';
    case ClusterDetailUpgradeModalPane.Changelog:
      return 'Start upgrade';
    default:
      return '';
  }
}

interface IClusterDetailUpgradeModalProps {
  fromRelease: releasev1alpha1.IRelease;
  toRelease: releasev1alpha1.IRelease;
  onClose?: () => void;
  visible?: boolean;
}

const ClusterDetailUpgradeModal: React.FC<IClusterDetailUpgradeModalProps> = ({
  fromRelease,
  toRelease,
  visible,
  onClose,
}) => {
  const [currentPane, setCurrentPane] = useState(
    ClusterDetailUpgradeModalPane.Disclaimer
  );

  const title = formatModalTitle(currentPane, fromRelease, toRelease);
  const primaryButtonText = formatPrimaryButtonText(currentPane);

  const handlePrimaryButtonClick = () => {
    if (currentPane === ClusterDetailUpgradeModalPane.Disclaimer) {
      setCurrentPane(currentPane + 1);
    }
  };

  return (
    <GenericModal
      footer={
        <>
          {primaryButtonText && (
            <Button bsStyle='primary' onClick={handlePrimaryButtonClick}>
              {primaryButtonText}
            </Button>
          )}
          <Button onClick={onClose}>Cancel</Button>
        </>
      }
      onClose={onClose}
      title={title}
      aria-label={title}
      visible={visible}
    >
      {currentPane === ClusterDetailUpgradeModalPane.Disclaimer && (
        <ClusterDetailUpgradeModalDisclaimer />
      )}
    </GenericModal>
  );
};

ClusterDetailUpgradeModal.propTypes = {
  fromRelease: (PropTypes.object as PropTypes.Requireable<releasev1alpha1.IRelease>)
    .isRequired,
  toRelease: (PropTypes.object as PropTypes.Requireable<releasev1alpha1.IRelease>)
    .isRequired,
  onClose: PropTypes.func,
  visible: PropTypes.bool,
};

export default ClusterDetailUpgradeModal;

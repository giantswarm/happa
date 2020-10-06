import PropTypes from 'prop-types';
import React from 'react';

interface IKubernetesVersionLabelProps {
  version?: string;
  hidePatchVersion?: boolean;
}

const KubernetesVersionLabel: React.FC<IKubernetesVersionLabelProps> = ({
  version,
  hidePatchVersion,
}) => {
  let versionLabel = 'n/a';

  if (version) {
    versionLabel = version;
    if (hidePatchVersion) {
      const v = version.split('.');
      versionLabel = [v[0], v[1]].join('.');
    }
  }

  return (
    <span>
      <i className='fa fa-kubernetes' title='Kubernetes version' />{' '}
      {versionLabel}
    </span>
  );
};

KubernetesVersionLabel.propTypes = {
  version: PropTypes.string,
  hidePatchVersion: PropTypes.bool,
};

KubernetesVersionLabel.defaultProps = {
  version: '',
  hidePatchVersion: true,
};

export default KubernetesVersionLabel;

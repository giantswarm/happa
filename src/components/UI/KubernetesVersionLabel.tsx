import PropTypes from 'prop-types';
import React from 'react';

interface IKubernetesVersionLabelProps {
  version?: string;
}

const KubernetesVersionLabel: React.FC<IKubernetesVersionLabelProps> = ({
  version,
}) => {
  let versionLabel = 'n/a';
  if (version) {
    // only show major and minor k8s version
    const v = version.split('.');
    versionLabel = [v[0], v[1]].join('.');
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
};

KubernetesVersionLabel.defaultProps = {
  version: '',
};

export default KubernetesVersionLabel;

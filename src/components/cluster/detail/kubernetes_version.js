import PropTypes from 'prop-types';
import React from 'react';

const KubernetesVersion = ({ components }) => {
  const kubernetes = components.find(
    component => component.name === 'kubernetes'
  );
  if (kubernetes) {
    return <span>&mdash; includes Kubernetes {kubernetes.version}</span>;
  }
};

// Default props in case there is a release without component.
KubernetesVersion.defaultProps = {
  components: [],
};

KubernetesVersion.PropTypes = {
  components: PropTypes.array,
};

export default KubernetesVersion;

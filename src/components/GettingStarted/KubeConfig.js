import { makeKubeConfigTextFile } from 'lib/helpers';
import PropTypes from 'prop-types';
import React from 'react';

import FileBlock from './FileBlock';

const KubeConfig = ({ cluster, keyPair }) => (
  <FileBlock fileName='giantswarm-kubeconfig'>
    {makeKubeConfigTextFile(cluster, keyPair)}
  </FileBlock>
);

KubeConfig.propTypes = {
  cluster: PropTypes.object,
  keyPair: PropTypes.object,
};

export default KubeConfig;

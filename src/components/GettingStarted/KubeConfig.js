import { makeKubeConfigTextFile } from 'lib/helpers';
import FileBlock from './FileBlock';
import PropTypes from 'prop-types';
import React from 'react';

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

import { makeKubeConfigTextFile } from '../../lib/helpers';
import FileBlock from './fileblock';
import PropTypes from 'prop-types';
import React from 'react';

class KubeConfig extends React.Component {
  render() {
    return (
      <FileBlock fileName='giantswarm-kubeconfig'>
        {makeKubeConfigTextFile(this.props.cluster, this.props.keyPair)}
      </FileBlock>
    );
  }
}

KubeConfig.propTypes = {
  cluster: PropTypes.object,
  keyPair: PropTypes.object,
};

export default KubeConfig;

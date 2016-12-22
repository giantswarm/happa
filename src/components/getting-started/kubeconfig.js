'use strict';
import React from 'react';
import FileBlock from './fileblock';
import {makeKubeConfigTextFile} from '../../lib/helpers';

class KubeConfig extends React.Component {
  render() {
    return <FileBlock fileName='giantswarm-kubeconfig'>
      { makeKubeConfigTextFile(this.props.cluster, this.props.keyPair) }
    </FileBlock>;
  }
}

KubeConfig.propTypes = {
  cluster: React.PropTypes.object,
  keyPair: React.PropTypes.object,
}

export default KubeConfig;
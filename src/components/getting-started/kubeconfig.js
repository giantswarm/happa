'use strict';
import React from 'react';
import FileBlock from './fileblock';

class KubeConfig extends React.Component {
  render() {
    return <FileBlock fileName='giantswarm-kubeconfig'>
      {`
      apiVersion: v1
      kind: Config
      clusters:
      - cluster:
          certificate-authority-data: ${btoa(this.props.keyPair.certificate_authority_data)}
          server: ${this.props.cluster.api_endpoint}
        name: ${this.props.cluster.name}
      contexts:
      - context:
          cluster: ${this.props.cluster.name}
          user: "giantswarm-default"
        name: giantswarm-default
      current-context: giantswarm-default
      users:
      - name: "giantswarm-default"
        user:
          client-certificate-data: ${btoa(this.props.keyPair.client_certificate_data)}
          client-key-data: ${btoa(this.props.keyPair.client_key_data)}
      `}
    </FileBlock>;
  }
}

module.exports = KubeConfig;
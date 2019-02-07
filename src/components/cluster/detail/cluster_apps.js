'use strict';

import Button from '../../shared/button';
import { connect } from 'react-redux';
import { NavLink } from 'react-router-dom';
import PropTypes from 'prop-types';
import React from 'react';

// This component gets a list of managed services from the release endpoint
// and tries to organize them in a predefined way.
// The `appMetas` object below is a mapping of known
// release component names to logos and categories.

// Since some components are not yet in the release endpoint output, but we do
// still want to see them on this page, we manually add them to the release endpoint
// response before running the mapping.

class ClusterApps extends React.Component {
  appMetas = {
    calico: {
      name: 'calico',
      logoUrl: '/images/app_icons/calico@2x.png',
      category: 'essentials',
    },
    'cluster-autoscaler': {
      name: 'cluster-autoscaler',
      logoUrl: '/images/app_icons/cluster_autoscaler@2x.png',
      category: 'essentials',
    },
    containerlinux: {
      name: 'containerlinux',
      logoUrl: '/images/app_icons/container_linux@2x.png',
      category: 'essentials',
    },
    coredns: {
      name: 'coredns',
      logoUrl: '/images/app_icons/coredns@2x.png',
      category: 'essentials',
    },
    docker: {
      name: 'docker',
      logoUrl: '/images/app_icons/docker@2x.png',
      category: 'essentials',
    },
    etcd: {
      name: 'etcd',
      logoUrl: '/images/app_icons/etcd@2x.png',
      category: 'essentials',
    },
    kubernetes: {
      name: 'kubernetes',
      logoUrl: '/images/app_icons/kubernetes@2x.png',
      category: 'essentials',
    },
    'metrics-server': {
      name: 'metrics-server',
      logoUrl: '/images/app_icons/metrics_server@2x.png',
      category: 'essentials',
    },
    'kube-state-metrics': {
      name: 'kube-state-metrics',
      logoUrl: '/images/app_icons/kube_state_metrics@2x.png',
      category: 'management',
    },
    'chart-operator': {
      name: 'chart-operator',
      logoUrl: '/images/app_icons/chart_operator@2x.png',
      category: 'management',
    },
    'cert-exporter': {
      name: 'cert-exporter',
      logoUrl: '/images/app_icons/chart_operator@2x.png',
      category: 'management',
    },
    'net-exporter': {
      name: 'net-exporter',
      logoUrl: '/images/app_icons/chart_operator@2x.png',
      category: 'management',
    },
    'node-exporter': {
      name: 'node-exporter',
      logoUrl: '/images/app_icons/node_exporter@2x.png',
      category: 'management',
    },
    'nginx-ingress-controller': {
      name: 'nginx-ingress-controller',
      logoUrl: '/images/app_icons/nginx_ingress_controller@2x.png',
      category: 'ingress',
    },
  };

  // manuallyAddAppMetas represent all the components we currently do not
  // have in the release endpoint response, but that we still want to show in
  // Happa.
  manuallyAddAppMetas = [
    {
      name: 'cert-exporter',
      logoUrl: '/images/app_icons/cert_exporter@2x.png',
      category: 'management',
      version: 'n/a',
    },
    {
      name: 'net-exporter',
      logoUrl: '/images/app_icons/net_exporter@2x.png',
      category: 'management',
      version: 'n/a',
    },
    {
      name: 'RBAC and PSP defaults',
      logoUrl: '/images/app_icons/rbac_and_psp_defaults@2x.png',
      category: 'essentials',
      version: 'n/a',
    },
  ];

  render() {
    var displayApps = {
      essentials: [],
      management: [],
      ingress: [],
    };

    for (var i = 0; i < this.props.release.components.length; i++) {
      var component = this.props.release.components[i];

      // Find the component in the mapping above. If it's not there, then
      // it isn't something we want to show here.
      if (this.appMetas[component.name]) {
        // Fetch the metadata as defined above.
        let appMeta = this.appMetas[component.name];

        // Add the version.
        appMeta.version = component.version;

        // Add the app to the list of apps we'll show in the interface, in the
        // correct category.
        displayApps[appMeta.category].push(appMeta);
      }
    }

    for (i = 0; i < this.manuallyAddAppMetas.length; i++) {
      let appMeta = this.manuallyAddAppMetas[i];

      displayApps[appMeta.category].push(appMeta);
    }

    return (
      <React.Fragment>
        <div className='row section cluster-apps'>
          <h3 className='table-label'>Managed Apps (Preview)</h3>
          <p>
            Soon you will be able to deploy managed apps like monitoring, log
            storage, and more simply by selecting from our catalog.
          </p>

          <NavLink
            to={`/organizations/${this.props.organizationId}/clusters/${
              this.props.clusterId
            }/app-catalog/`}
          >
            <Button>Browse Apps</Button>
          </NavLink>
        </div>

        <div className='row section cluster-apps'>
          <h3 className='table-label'>Preinstalled Services</h3>
          <p>
            These services are preinstalled on your cluster and managed by Giant
            Swarm.
          </p>
          <div className='row'>
            {Object.keys(displayApps).map(appCategory => {
              return (
                <div className='col-4' key={appCategory}>
                  <h6>{appCategory}</h6>
                  {displayApps[appCategory].map(app => {
                    return (
                      <div className='cluster-apps--app' key={app.name}>
                        <img src={app.logoUrl} alt={app.title + ' icon'} />
                        {app.name}
                        <small>{app.version}&nbsp;</small>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </React.Fragment>
    );
  }
}

ClusterApps.propTypes = {
  clusterId: PropTypes.string,
  organizationId: PropTypes.string,
  release: PropTypes.object,
};

export default connect(
  null,
  null
)(ClusterApps);

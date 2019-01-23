'use strict';

import React from 'react';
// import PropTypes from 'prop-types';

// This component gets a list of managed services from the release endpoint
// and tries to organize them in a predefined way.
// The `preinstalledAppCategories` object below is a mapping of components
// to logos and categories.

// Since some components are not yet in the release endpoint output, but we do
// still want to see them on this page, we manually add them to the release endpoint
// response before running the mapping.

class ClusterApps extends React.Component {
  preinstalledAppCategories = [
    {
      title: 'Essentials',
      apps: [
        {
          title: 'calico',
          logoUrl: '/images/app_icons/calico@2x.png',
        },
        {
          title: 'containerlinux',
          logoUrl: '/images/app_icons/container_linux@2x.png',
        },
        {
          title: 'coredns',
          logoUrl: '/images/app_icons/coredns@2x.png',
        },
        {
          title: 'docker',
          logoUrl: '/images/app_icons/docker@2x.png',
        },
        {
          title: 'kubernetes',
          logoUrl: '/images/app_icons/kubernetes@2x.png',
        },
        {
          title: 'etcd',
          logoUrl: '/images/app_icons/etcd@2x.png',
        },
        {
          title: 'RBAC and PSP defaults',
          version: '',
          logoUrl: '/images/app_icons/rbac_and_psp_defaults@2x.png',
        },
      ],
    },
    {
      title: 'Management',
      apps: [
        {
          title: 'kube-state-metrics',
          logoUrl: '/images/app_icons/kube_state_metrics@2x.png',
        },
        {
          title: 'node-exporter',
          logoUrl: '/images/app_icons/node_exporter@2x.png',
        },
        {
          title: 'chart-operator',
          logoUrl: '/images/app_icons/chart_operator@2x.png',
        },
        {
          title: 'cert-exporter',
          logoUrl: '/images/app_icons/chart_operator@2x.png',
        },
        {
          title: 'net-exporter',
          logoUrl: '/images/app_icons/chart_operator@2x.png',
        },
      ],
    },
    {
      title: 'Ingress',
      apps: [
        {
          title: 'nginx-ingress-controller',
          logoUrl: '/images/app_icons/nginx_ingress_controller@2x.png',
        },
      ],
    },
  ];

  render() {
    return (
      <React.Fragment>
        <div className='row section cluster-apps'>
          <h3 className='table-label'>Managed Services</h3>
          <p>
            These services are preinstalled on your cluster and managed by Giant
            Swarm.
          </p>
          <div className='row'>
            {this.preinstalledAppCategories.map(appCategory => {
              return (
                <div className='col-4' key={appCategory.title}>
                  <h6>{appCategory.title}</h6>
                  {appCategory.apps.map(app => {
                    return (
                      <div className='cluster-apps--app' key={app.title}>
                        <img src={app.logoUrl} alt={app.title + ' icon'} />
                        {app.title}
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

ClusterApps.propTypes = {};

export default ClusterApps;

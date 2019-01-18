'use strict';

import React from 'react';
// import PropTypes from 'prop-types';

class ClusterApps extends React.Component {
  preinstalledAppCategories = [
    {
      title: 'Essentials',
      apps: [
        {
          title: 'Kubernetes Components',
          logoUrl: '/images/app_icons/kubernetes_components@2x.png',
        },
        {
          title: 'CoreDNS',
          logoUrl: '/images/app_icons/coredns@2x.png',
        },
        {
          title: 'Calico',
          logoUrl: '/images/app_icons/calico@2x.png',
        },
        {
          title: 'RBAC and PSP defaults',
          logoUrl: '/images/app_icons/rbac_and_psp_defaults@2x.png',
        },
      ],
    },
    {
      title: 'Management',
      apps: [
        {
          title: 'Tiller',
          logoUrl: '/images/app_icons/tiller@2x.png',
        },
        {
          title: 'chart-operator',
          logoUrl: '/images/app_icons/chart_operator@2x.png',
        },
        {
          title: 'node-exporter',
          logoUrl: '/images/app_icons/node_exporter@2x.png',
        },
        {
          title: 'kube-state-metrics',
          logoUrl: '/images/app_icons/kube_state_metrics@2x.png',
        },
      ],
    },
    {
      title: 'Ingress',
      apps: [
        {
          title: 'NGINX Ingress Controller',
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

import { compare } from 'lib/semver';

import { Constants } from './';

export interface IAppMetaApp {
  name: string;
  logoUrl: string;
  category: 'essentials' | 'management' | 'ingress';
  version?: string;
}

/**
 * A mapping of known apps and their information.
 */
export const appMetas: Record<
  string,
  IAppMetaApp | ((version: string) => IAppMetaApp)
> = {
  'aws-cni': {
    name: 'aws-cni',
    logoUrl: '/images/app_icons/awscni@2x.png',
    category: 'essentials',
  },
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
  containerlinux: (version: string) => {
    const component: IAppMetaApp = {
      name: 'containerlinux',
      logoUrl: '/images/app_icons/container_linux@2x.png',
      category: 'essentials',
    };

    if (compare(version, Constants.FLATCAR_CONTAINERLINUX_SINCE) >= 0) {
      component.logoUrl = '/images/app_icons/flatcar_linux@2x.png';
    }

    return component;
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
    logoUrl: '/images/app_icons/cert_exporter@2x.png',
    category: 'management',
  },
  'net-exporter': {
    name: 'net-exporter',
    logoUrl: '/images/app_icons/net_exporter@2x.png',
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
  kiam: {
    name: 'kiam',
    logoUrl: '/images/app_icons/kiam@2x.png',
    category: 'essentials',
  },
  'external-dns': {
    name: 'external-dns',
    logoUrl: '/images/app_icons/external_dns@2x.png',
    category: 'essentials',
  },
  'cert-manager': {
    name: 'cert-manager',
    logoUrl: '/images/app_icons/cert_manager@2x.png',
    category: 'essentials',
  },
};

export const defaultAppMetas: Record<string, IAppMetaApp> = {
  'cert-exporter': {
    name: 'cert-exporter',
    logoUrl: '/images/app_icons/cert_exporter@2x.png',
    category: 'management',
  },
  'net-exporter': {
    name: 'net-exporter',
    logoUrl: '/images/app_icons/net_exporter@2x.png',
    category: 'management',
  },
  'RBAC and PSP defaults': {
    name: 'RBAC and PSP defaults',
    logoUrl: '/images/app_icons/rbac_and_psp_defaults@2x.png',
    category: 'essentials',
  },
};

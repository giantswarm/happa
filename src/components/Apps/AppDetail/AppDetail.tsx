import React from 'react';
import { Breadcrumb } from 'react-breadcrumbs';
import { useRouteMatch } from 'react-router-dom';
import AppDetailPage from 'UI/Display/Apps/AppDetailNew/AppDetailPage';

const readme = `[![CircleCI](https://circleci.com/gh/giantswarm/prometheus-operator-app.svg?style=shield)](https://circleci.com/gh/giantswarm/prometheus-operator-app)

# prometheus-operator-app chart

Giant Swarm offers a Prometheus Operator Managed App which can be installed in
tenant clusters. Here we define the Prometheus chart with its templates and
default configuration.

Be aware by default the CRDs are not installed in the cluster to avoid collisions with existing deployments of the chart. So in case it is the first time you install the chart set the parameter \`prometheusOperator.createCustomResource\` to \`true\` in you values configuration.

Alternatively you can create the necessary \`CustomResourceDefinition\`s manually on your cluster:

\`\`\`
kubectl create -f https://raw.githubusercontent.com/helm/charts/master/stable/prometheus-operator/crds/crd-alertmanager.yaml
kubectl create -f https://raw.githubusercontent.com/helm/charts/master/stable/prometheus-operator/crds/crd-podmonitor.yaml
kubectl create -f https://raw.githubusercontent.com/helm/charts/master/stable/prometheus-operator/crds/crd-prometheus.yaml
kubectl create -f https://raw.githubusercontent.com/helm/charts/master/stable/prometheus-operator/crds/crd-prometheusrules.yaml
kubectl create -f https://raw.githubusercontent.com/helm/charts/master/stable/prometheus-operator/crds/crd-servicemonitor.yaml
kubectl create -f https://raw.githubusercontent.com/helm/charts/master/stable/prometheus-operator/crds/crd-thanosrulers.yaml
\`\`\`

## Good to know

The default configuration of this chart ignores secrets of type \`helm.sh/release.v1\`. This can be changed by changing the value of \`prometheusOperator.secretFieldSelector\` in your values.yaml. Example:

\`\`\`
prometheusOperator:
  secretFieldSelector: ""
\`\`\``;

const AppDetail: React.FC = () => {
  const match = useRouteMatch();

  return (
    <Breadcrumb
      data={{
        title: 'efk-stack-app'.toUpperCase(),
        pathname: match.url,
      }}
    >
      <AppDetailPage
        appTitle='efk-stack-app'
        appIconURL='/images/repo_icons/managed.png'
        catalogName='Giant Swarm Managed'
        chartVersion='v0.3.2'
        createDate={new Date(2021, 0, 1)}
        includesVersion='v1.9.0'
        description='Open Distro for ElasticSearch'
        website='github.com/giantswarm/efk-stack-app'
        keywords={['elk', 'database', 'fluentd', 'logging', 'search']}
        readme={readme}
      />
    </Breadcrumb>
  );
};

export default AppDetail;

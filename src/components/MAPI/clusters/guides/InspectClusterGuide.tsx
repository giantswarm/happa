import LoginGuideStep from 'MAPI/guides/LoginGuideStep';
import {
  getCurrentInstallationContextName,
  makeKubectlGSCommand,
  withContext,
  withFormatting,
  withGetClusters,
} from 'MAPI/guides/utils';
import { Providers } from 'model/constants';
import * as docs from 'model/constants/docs';
import React from 'react';
import CLIGuide from 'UI/Display/MAPI/CLIGuide';
import CLIGuideAdditionalInfo from 'UI/Display/MAPI/CLIGuide/CLIGuideAdditionalInfo';
import CLIGuideStep from 'UI/Display/MAPI/CLIGuide/CLIGuideStep';
import CLIGuideStepList from 'UI/Display/MAPI/CLIGuide/CLIGuideStepList';

function getProviderCRDLinks(provider: PropertiesOf<typeof Providers>) {
  switch (provider) {
    case Providers.AZURE:
      return [
        {
          label: 'AzureCluster CRD schema',
          href: docs.crdSchemaURL(docs.crds.xk8sio.azureCluster),
          external: true,
        },
        {
          label: 'AzureMachine CRD schema',
          href: docs.crdSchemaURL(docs.crds.xk8sio.azureMachine),
          external: true,
        },
      ];
    case Providers.AWS:
      return [
        {
          label: 'AWSCluster CRD schema',
          href: docs.crdSchemaURL(docs.crds.giantswarmio.awsCluster),
          external: true,
        },
        {
          label: 'AWSControlPlane CRD schema',
          href: docs.crdSchemaURL(docs.crds.giantswarmio.awsControlPlane),
          external: true,
        },
        {
          label: 'G8SControlPlane CRD schema',
          href: docs.crdSchemaURL(docs.crds.giantswarmio.g8sControlPlane),
          external: true,
        },
      ];
    default:
      return [];
  }
}

interface IInspectClusterGuideProps
  extends Omit<React.ComponentPropsWithoutRef<typeof CLIGuide>, 'title'> {
  provider: PropertiesOf<typeof Providers>;
  clusterName: string;
  clusterNamespace: string;
}

const InspectClusterGuide: React.FC<IInspectClusterGuideProps> = ({
  provider,
  clusterName,
  clusterNamespace,
  ...props
}) => {
  const context = getCurrentInstallationContextName();

  return (
    <CLIGuide
      title='Inspect this cluster via the Management API'
      footer={
        <CLIGuideAdditionalInfo
          links={[
            {
              label: 'kubectl gs plugin installation',
              href: docs.kubectlGSInstallationURL,
              external: true,
            },
            {
              label: 'Cluster CRD schema',
              href: docs.crdSchemaURL(docs.crds.xk8sio.cluster),
              external: true,
            },
            ...getProviderCRDLinks(provider),
            {
              label: 'Management API introduction',
              href: docs.managementAPIIntroduction,
              external: true,
            },
          ]}
        />
      }
      {...props}
    >
      <CLIGuideStepList>
        <LoginGuideStep />
        <CLIGuideStep
          title='2. Show main details'
          command={makeKubectlGSCommand(
            withContext(context),
            withGetClusters({
              name: clusterName,
              namespace: clusterNamespace,
            }),
            withFormatting()
          )}
        />

        {provider === Providers.AZURE && (
          <>
            <CLIGuideStep
              title={
                <>
                  3. Show the <code>AzureCluster</code> resource
                </>
              }
              command={`
              kubectl --context ${context} \\
                get azureclusters.infrastructure.cluster.x-k8s.io ${clusterName} \\
                --namespace ${clusterNamespace} --output json
              `}
            />
            <CLIGuideStep
              title={
                <>
                  4. Show the <code>AzureMachine</code> resources representing
                  the control plane nodes
                </>
              }
              command={`
              kubectl --context ${context} \\
                get azuremachines.infrastructure.cluster.x-k8s.io \\
                --selector cluster.x-k8s.io/cluster-name=${clusterName} \\
                --namespace ${clusterNamespace}
              `}
            />
          </>
        )}
        {provider === Providers.AWS && (
          <>
            <CLIGuideStep
              title={
                <>
                  3. Show the <code>AWSCluster</code> resource
                </>
              }
              command={`
              kubectl --context ${context} \\
                get awscluster.infrastructure.giantswarm.io ${clusterName} \\
                --namespace ${clusterNamespace} --output json
              `}
            />
            <CLIGuideStep
              title={
                <>
                  4. Show the <code>AWSControlPlane</code> resources
                  representing the control plane nodes
                </>
              }
              command={`
              kubectl --context ${context} \\
                get awscontrolplanes.infrastructure.giantswarm.io \\
                --selector cluster.x-k8s.io/cluster-name=${clusterName} \\
                --namespace ${clusterNamespace}
              `}
            />
            <CLIGuideStep
              title={
                <>
                  5. Show the <code>G8sControlPlane</code> resources
                  representing the control plane nodes
                </>
              }
              command={`
              kubectl --context ${context} \\
                get g8scontrolplanes.infrastructure.giantswarm.io \\
                --selector cluster.x-k8s.io/cluster-name=${clusterName} \\
                --namespace ${clusterNamespace}
              `}
            />
          </>
        )}
      </CLIGuideStepList>
    </CLIGuide>
  );
};

export default InspectClusterGuide;

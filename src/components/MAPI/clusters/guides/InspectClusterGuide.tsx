import * as docs from 'lib/docs';
import LoginGuideStep from 'MAPI/guides/LoginGuideStep';
import {
  getCurrentInstallationContextName,
  makeKubectlGSCommand,
  withContext,
  withFormatting,
  withGetClusters,
} from 'MAPI/guides/utils';
import React from 'react';
import { useSelector } from 'react-redux';
import { Providers } from 'shared/constants';
import { PropertiesOf } from 'shared/types';
import CLIGuide from 'UI/Display/MAPI/CLIGuide';
import CLIGuideAdditionalInfo from 'UI/Display/MAPI/CLIGuide/CLIGuideAdditionalInfo';
import CLIGuideStep from 'UI/Display/MAPI/CLIGuide/CLIGuideStep';
import CLIGuideStepList from 'UI/Display/MAPI/CLIGuide/CLIGuideStepList';

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
  const context = useSelector(getCurrentInstallationContextName);

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
      </CLIGuideStepList>
    </CLIGuide>
  );
};

export default InspectClusterGuide;

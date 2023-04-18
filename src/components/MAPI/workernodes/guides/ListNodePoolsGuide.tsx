import { Text } from 'grommet';
import LoginGuideStep from 'MAPI/guides/LoginGuideStep';
import { getCurrentInstallationContextName } from 'MAPI/guides/utils';
import { Providers } from 'model/constants';
import * as docs from 'model/constants/docs';
import React from 'react';
import CLIGuide from 'UI/Display/MAPI/CLIGuide';
import CLIGuideAdditionalInfo from 'UI/Display/MAPI/CLIGuide/CLIGuideAdditionalInfo';
import CLIGuideStep from 'UI/Display/MAPI/CLIGuide/CLIGuideStep';
import CLIGuideStepList from 'UI/Display/MAPI/CLIGuide/CLIGuideStepList';

function getProviderNodePoolResourceName(
  provider: PropertiesOf<typeof Providers>
) {
  switch (provider) {
    case Providers.AWS:
    case Providers.CAPZ:
    case Providers.GCP:
      return 'MachineDeployment';
    default:
      return 'MachinePool';
  }
}
interface IListNodePoolsGuideProps
  extends Omit<React.ComponentPropsWithoutRef<typeof CLIGuide>, 'title'> {
  clusterName: string;
  clusterNamespace: string;
  provider: PropertiesOf<typeof Providers>;
}

const ListNodePoolsGuide: React.FC<
  React.PropsWithChildren<IListNodePoolsGuideProps>
> = ({ clusterName, clusterNamespace, provider, ...props }) => {
  const context = getCurrentInstallationContextName();
  const providerNodePoolResourceName =
    getProviderNodePoolResourceName(provider);

  return (
    <CLIGuide
      title="List this cluster's node pools via the Management API"
      footer={
        <CLIGuideAdditionalInfo
          links={[
            {
              label: 'kubectl gs plugin installation',
              href: docs.kubectlGSInstallationURL,
              external: true,
            },
            {
              label: 'kubectl gs get nodepools command',
              href: docs.kubectlGSGetNodePoolsURL,
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
          title='2. List node pools'
          command={
            provider === Providers.CAPA
              ? `
              kubectl --context ${context} \\
                get machinepools.cluster.x-k8s.io \\
                --selector cluster.x-k8s.io/cluster-name=${clusterName} \\
                --namespace ${clusterNamespace}`
              : provider === Providers.CAPZ || provider === Providers.GCP
              ? `
              kubectl --context ${context} \\
                get machinedeployments.cluster.x-k8s.io \\
                --selector cluster.x-k8s.io/cluster-name=${clusterName},cluster.x-k8s.io/role!=bastion \\
                --namespace ${clusterNamespace}`
              : `
              kubectl gs --context ${context} \\
                get nodepools \\
                --cluster-name ${clusterName} \\
                --namespace ${clusterNamespace}`
          }
        >
          <Text>
            <strong>Note:</strong> Add <code>--output json</code> to include
            full <code>{providerNodePoolResourceName}</code> resource details in
            a machine-readable format.
          </Text>
        </CLIGuideStep>
      </CLIGuideStepList>
    </CLIGuide>
  );
};

export default ListNodePoolsGuide;

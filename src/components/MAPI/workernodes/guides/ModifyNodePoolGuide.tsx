import { Text } from 'grommet';
import * as docs from 'lib/docs';
import LoginGuideStep from 'MAPI/guides/LoginGuideStep';
import { getCurrentInstallationContextName } from 'MAPI/guides/utils';
import React from 'react';
import { Providers } from 'shared/constants';
import CLIGuide from 'UI/Display/MAPI/CLIGuide';
import CLIGuideAdditionalInfo from 'UI/Display/MAPI/CLIGuide/CLIGuideAdditionalInfo';
import CLIGuideStep from 'UI/Display/MAPI/CLIGuide/CLIGuideStep';
import CLIGuideStepList from 'UI/Display/MAPI/CLIGuide/CLIGuideStepList';

interface IModifyNodePoolGuideProps
  extends Omit<React.ComponentPropsWithoutRef<typeof CLIGuide>, 'title'> {
  clusterNamespace: string;
  provider: PropertiesOf<typeof Providers>;
}

const ModifyNodePoolGuide: React.FC<IModifyNodePoolGuideProps> = ({
  clusterNamespace,
  provider,
  ...props
}) => {
  const context = getCurrentInstallationContextName();

  return (
    <CLIGuide
      title='Modify a node pool via the Management API'
      footer={
        <CLIGuideAdditionalInfo
          links={[
            {
              label: 'kubectl gs plugin installation',
              href: docs.kubectlGSInstallationURL,
              external: true,
            },
            {
              label: 'MachinePool CRD Schema',
              href: docs.crdSchemaURL(docs.crds.xk8sio.machinepool),
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
          title='2. Update the node pool description'
          command={
            provider === Providers.AWS
              ? `
          kubectl --context ${context} \\
            patch awsmachinedeployments.infrastructure.giantswarm.io my-np \\
            --namespace ${clusterNamespace} \\
            --type merge \\
            --patch '{"spec": {"nodePool": {"description": "General purpose nodes"}}}'`
              : `
          kubectl --context ${context} \\
            patch machinepools.exp.cluster.x-k8s.io my-np \\
            --namespace ${clusterNamespace} \\
            --type merge \\
            --patch '{"metadata": {"annotations": {"machine-pool.giantswarm.io/name": "General purpose nodes"}}}'
          `
          }
        >
          <Text>
            Make sure to replace <code>my-np</code> with the correct node pool
            name.
          </Text>
        </CLIGuideStep>
        <CLIGuideStep
          title='3. Update the node pool scaling range'
          command={
            provider === Providers.AWS
              ? `
          kubectl --context ${context} \\
            patch awsmachinedeployments.infrastructure.giantswarm.io my-np \\
            --namespace ${clusterNamespace} \\
            --type merge \\
            --patch '{"spec": {"nodePool": {"scaling": {"min": 3, "max": 10}}}}'
          `
              : `
          kubectl --context ${context} \\
            patch machinepools.exp.cluster.x-k8s.io my-np \\
            --namespace ${clusterNamespace} \\
            --type merge \\
            --patch '{"metadata": {"annotations": {"cluster.k8s.io/cluster-api-autoscaler-node-group-min-size": "3", "cluster.k8s.io/cluster-api-autoscaler-node-group-max-size": "10"}}}'
          `
          }
        >
          <Text>
            Again, make sure to replace <code>my-np</code> with the correct node
            pool name.
          </Text>
        </CLIGuideStep>
      </CLIGuideStepList>
    </CLIGuide>
  );
};

export default ModifyNodePoolGuide;

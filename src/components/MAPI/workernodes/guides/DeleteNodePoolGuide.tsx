import { Text } from 'grommet';
import LoginGuideStep from 'MAPI/guides/LoginGuideStep';
import UnauthorizedMessage from 'MAPI/guides/UnauthorizedMessage';
import { getCurrentInstallationContextName } from 'MAPI/guides/utils';
import { Providers } from 'model/constants';
import * as docs from 'model/constants/docs';
import React from 'react';
import CLIGuide from 'UI/Display/MAPI/CLIGuide';
import CLIGuideAdditionalInfo from 'UI/Display/MAPI/CLIGuide/CLIGuideAdditionalInfo';
import CLIGuideStep from 'UI/Display/MAPI/CLIGuide/CLIGuideStep';
import CLIGuideStepList from 'UI/Display/MAPI/CLIGuide/CLIGuideStepList';

interface IDeleteNodePoolGuideProps
  extends Omit<React.ComponentPropsWithoutRef<typeof CLIGuide>, 'title'> {
  clusterNamespace: string;
  provider: PropertiesOf<typeof Providers>;
  canDeleteNodePools?: boolean;
}

const DeleteNodePoolGuide: React.FC<
  React.PropsWithChildren<IDeleteNodePoolGuideProps>
> = ({ clusterNamespace, provider, canDeleteNodePools, ...props }) => {
  const context = getCurrentInstallationContextName();

  return (
    <CLIGuide
      title='Delete a node pool via the Management API'
      footer={
        <CLIGuideAdditionalInfo
          links={[
            {
              label: 'kubectl gs plugin installation',
              href: docs.kubectlGSInstallationURL,
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
        {!canDeleteNodePools && <UnauthorizedMessage />}
        <LoginGuideStep />
        <CLIGuideStep
          title='2. Delete a node pool'
          command={`
          kubectl --context ${context} \\
            delete ${
              provider === Providers.AWS
                ? 'machinedeployments.cluster.x-k8s.io,awsmachinedeployments.infrastructure.giantswarm.io'
                : 'machinepools.exp.cluster.x-k8s.io'
            } my-np \\
            --namespace ${clusterNamespace}
          `}
        >
          <Text>
            Replace <code>my-np</code> with the name of the node pool to delete.
          </Text>
          <Text>
            <strong>Note:</strong> This will result in the deletion of worker
            nodes. Data stored on worker nodes or in ephemeral volumes will be
            lost. There is no way to undo this. To allow scheduling of workloads
            to other worker nodes, make sure to have other node pools available.
          </Text>
        </CLIGuideStep>
      </CLIGuideStepList>
    </CLIGuide>
  );
};

export default DeleteNodePoolGuide;

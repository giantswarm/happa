import { Text } from 'grommet';
import * as docs from 'lib/docs';
import LoginGuideStep from 'MAPI/guides/LoginGuideStep';
import { getCurrentInstallationContextName } from 'MAPI/guides/utils';
import React from 'react';
import CLIGuide from 'UI/Display/MAPI/CLIGuide';
import CLIGuideAdditionalInfo from 'UI/Display/MAPI/CLIGuide/CLIGuideAdditionalInfo';
import CLIGuideStep from 'UI/Display/MAPI/CLIGuide/CLIGuideStep';
import CLIGuideStepList from 'UI/Display/MAPI/CLIGuide/CLIGuideStepList';

interface IDeleteNodePoolGuideProps
  extends Omit<React.ComponentPropsWithoutRef<typeof CLIGuide>, 'title'> {
  clusterNamespace: string;
}

const DeleteNodePoolGuide: React.FC<IDeleteNodePoolGuideProps> = ({
  clusterNamespace,
  ...props
}) => {
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
        <LoginGuideStep />
        <CLIGuideStep
          title='2. Delete a node pool'
          command={`
          kubectl --context ${context} \\
            delete machinepools.exp.cluster.x-k8s.io my-np \\
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

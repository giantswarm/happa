import { Text } from 'grommet';
import LoginGuideStep from 'MAPI/guides/LoginGuideStep';
import { getCurrentInstallationContextName } from 'MAPI/guides/utils';
import { Providers } from 'model/constants';
import * as docs from 'model/constants/docs';
import React from 'react';
import { useSelector } from 'react-redux';
import CLIGuide from 'UI/Display/MAPI/CLIGuide';
import CLIGuideAdditionalInfo from 'UI/Display/MAPI/CLIGuide/CLIGuideAdditionalInfo';
import CLIGuideStep from 'UI/Display/MAPI/CLIGuide/CLIGuideStep';
import CLIGuideStepList from 'UI/Display/MAPI/CLIGuide/CLIGuideStepList';

interface IDeleteClusterGuideProps
  extends Omit<React.ComponentPropsWithoutRef<typeof CLIGuide>, 'title'> {
  clusterName: string;
  namespace: string;
  provider: PropertiesOf<typeof Providers>;
}

const DeleteClusterGuide: React.FC<IDeleteClusterGuideProps> = ({
  clusterName,
  namespace,
  provider,
  ...props
}) => {
  const context = useSelector(getCurrentInstallationContextName);

  return (
    <CLIGuide
      title='Delete this cluster via the Management API'
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
          title='2. Delete the cluster'
          command={
            provider === Providers.AWS
              ? `
              kubectl --context ${context} \\
                delete clusters.cluster.x-k8s.io,awsclusters.infrastructure.giantswarm.io,awscontrolplane,g8scontrolplane \\
                --selector giantswarm.io/cluster=${clusterName} \\
                --namespace ${namespace}
              `
              : `
              kubectl --context ${context} delete cluster ${clusterName} --namespace ${namespace}
              `
          }
        >
          <Text>
            <strong>Warning:</strong> This action terminates all workloads and
            destroys all data stored on ephemeral storage. There is no undo.
            Before you proceed, make sure you really want to delete this
            cluster.
          </Text>
        </CLIGuideStep>
      </CLIGuideStepList>
    </CLIGuide>
  );
};

export default DeleteClusterGuide;

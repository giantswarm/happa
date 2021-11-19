import { Text } from 'grommet';
import * as docs from 'lib/docs';
import LoginGuideStep from 'MAPI/guides/LoginGuideStep';
import {
  getCurrentInstallationContextName,
  makeKubectlGSCommand,
  withFormatting,
  withTemplateCluster,
} from 'MAPI/guides/utils';
import React from 'react';
import { Providers } from 'shared/constants';
import CLIGuide from 'UI/Display/MAPI/CLIGuide';
import CLIGuideAdditionalInfo from 'UI/Display/MAPI/CLIGuide/CLIGuideAdditionalInfo';
import CLIGuideStep from 'UI/Display/MAPI/CLIGuide/CLIGuideStep';
import CLIGuideStepList from 'UI/Display/MAPI/CLIGuide/CLIGuideStepList';

interface ICreateClusterGuideProps
  extends Omit<React.ComponentPropsWithoutRef<typeof CLIGuide>, 'title'> {
  provider: PropertiesOf<typeof Providers>;
  clusterName: string;
  organizationName: string;
  releaseVersion?: string;
  description?: string;
  labels?: Record<string, string>;
  controlPlaneAZs?: string[];
}

const CreateClusterGuide: React.FC<ICreateClusterGuideProps> = ({
  provider,
  clusterName,
  organizationName,
  releaseVersion,
  description,
  labels,
  controlPlaneAZs,
  ...props
}) => {
  const context = getCurrentInstallationContextName();

  return (
    <CLIGuide
      title='Create a cluster via the Management API'
      footer={
        <CLIGuideAdditionalInfo
          links={[
            {
              label: 'kubectl gs plugin installation',
              href: docs.kubectlGSInstallationURL,
              external: true,
            },
            {
              label: 'kubectl gs template cluster command',
              href: docs.kubectlGSTemplateClusterURL,
              external: true,
            },
            {
              label: 'Cluster CRD schema',
              href: docs.crdSchemaURL(docs.crds.xk8sio.cluster),
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
          title='2. Create a cluster manifest'
          command={makeKubectlGSCommand(
            withTemplateCluster({
              provider,
              owner: organizationName,
              name: clusterName,
              release: releaseVersion,
              description,
              controlPlaneAZs,
              labels,
              output: `cluster-${clusterName}.yaml`,
            }),
            withFormatting()
          )}
        />
        <CLIGuideStep
          title='3. Apply the manifest'
          command={`kubectl apply --context ${context} -f cluster-${clusterName}.yaml`}
        >
          <Text>
            As a result, a cluster without worker nodes will get created.
          </Text>
        </CLIGuideStep>
      </CLIGuideStepList>
    </CLIGuide>
  );
};

export default CreateClusterGuide;

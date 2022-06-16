import { Text } from 'grommet';
import LoginGuideStep from 'MAPI/guides/LoginGuideStep';
import {
  getCurrentInstallationContextName,
  makeKubectlGSCommand,
  withFormatting,
  withTemplateCluster,
} from 'MAPI/guides/utils';
import { Providers } from 'model/constants';
import * as docs from 'model/constants/docs';
import * as capiv1beta1 from 'model/services/mapi/capiv1beta1';
import React from 'react';
import CLIGuide from 'UI/Display/MAPI/CLIGuide';
import CLIGuideAdditionalInfo from 'UI/Display/MAPI/CLIGuide/CLIGuideAdditionalInfo';
import CLIGuideStep from 'UI/Display/MAPI/CLIGuide/CLIGuideStep';
import CLIGuideStepList from 'UI/Display/MAPI/CLIGuide/CLIGuideStepList';

function filterServicePriorityLabel(labels: IClusterLabelMap) {
  return Object.keys(labels)
    .filter((key) => key !== capiv1beta1.labelServicePriority)
    .reduce(
      (obj, key) =>
        Object.assign(obj, {
          [key]: labels[key],
        }),
      {}
    );
}

interface ICreateClusterGuideProps
  extends Omit<React.ComponentPropsWithoutRef<typeof CLIGuide>, 'title'> {
  provider: PropertiesOf<typeof Providers>;
  clusterName: string;
  organizationName: string;
  releaseVersion?: string;
  description?: string;
  labels?: IClusterLabelMap;
  servicePriority?: string;
  controlPlaneAZs?: string[];
}

const CreateClusterGuide: React.FC<
  React.PropsWithChildren<ICreateClusterGuideProps>
> = ({
  provider,
  clusterName,
  organizationName,
  releaseVersion,
  description,
  labels,
  servicePriority,
  controlPlaneAZs,
  ...props
}) => {
  const context = getCurrentInstallationContextName();

  const visibleLabels =
    labels && servicePriority ? filterServicePriorityLabel(labels) : labels;

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
              organization: organizationName,
              name: clusterName,
              release: releaseVersion,
              description,
              controlPlaneAZs,
              labels: visibleLabels,
              servicePriority,
              output: `cluster-${clusterName}.yaml`,
            }),
            withFormatting()
          )}
        />
        <CLIGuideStep
          title='3. Apply the manifest'
          command={`kubectl apply --context ${context} --filename cluster-${clusterName}.yaml`}
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

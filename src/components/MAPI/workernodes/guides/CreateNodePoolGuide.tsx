import { Text } from 'grommet';
import * as docs from 'lib/docs';
import LoginGuideStep from 'MAPI/guides/LoginGuideStep';
import {
  getCurrentInstallationContextName,
  makeKubectlGSCommand,
  withFormatting,
  withTemplateNodePool,
} from 'MAPI/guides/utils';
import React from 'react';
import { Providers } from 'shared/constants';
import CLIGuide from 'UI/Display/MAPI/CLIGuide';
import CLIGuideAdditionalInfo from 'UI/Display/MAPI/CLIGuide/CLIGuideAdditionalInfo';
import CLIGuideStep from 'UI/Display/MAPI/CLIGuide/CLIGuideStep';
import CLIGuideStepList from 'UI/Display/MAPI/CLIGuide/CLIGuideStepList';

interface ICreateNodePoolGuide
  extends Omit<React.ComponentPropsWithoutRef<typeof CLIGuide>, 'title'> {
  provider: PropertiesOf<typeof Providers>;
  organizationName: string;
  clusterName: string;
  description?: string;
  machineType?: string;
  nodePoolAZs?: string[];
  azureUseSpotVMs?: boolean;
  azureSpotVMsMaxPrice?: number;
  awsOnDemandBaseCapacity?: number;
  awsOnDemandPercentageAboveBaseCapacity?: number;
  nodesMin?: number;
  nodesMax?: number;
}

const CreateNodePoolGuide: React.FC<ICreateNodePoolGuide> = ({
  provider,
  organizationName,
  clusterName,
  description,
  machineType,
  nodePoolAZs,
  azureUseSpotVMs,
  azureSpotVMsMaxPrice,
  awsOnDemandBaseCapacity,
  awsOnDemandPercentageAboveBaseCapacity,
  nodesMin,
  nodesMax,
  ...props
}) => {
  const context = getCurrentInstallationContextName();

  const vmSize = provider === Providers.AZURE ? machineType : undefined;
  const instanceType = provider === Providers.AWS ? machineType : undefined;

  return (
    <CLIGuide
      title='Create a node pool via the Management API'
      footer={
        <CLIGuideAdditionalInfo
          links={[
            {
              label: 'kubectl gs plugin installation',
              href: docs.kubectlGSInstallationURL,
              external: true,
            },
            {
              label: 'kubectl gs template nodepool command',
              href: docs.kubectlGSTemplateNodePoolURL,
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
          title='2. Create a node pool manifest'
          command={makeKubectlGSCommand(
            withTemplateNodePool({
              provider,
              owner: organizationName,
              clusterName,
              description,
              azureVMSize: vmSize,
              awsInstanceType: instanceType,
              nodePoolAZs,
              azureUseSpotVMs,
              azureSpotVMsMaxPrice,
              awsOnDemandBaseCapacity,
              awsOnDemandPercentageAboveBaseCapacity,
              nodesMin,
              nodesMax,
              output: `cluster-${clusterName}-nodepool.yaml`,
            }),
            withFormatting()
          )}
        />
        <CLIGuideStep
          title='3. Apply the manifest'
          command={`kubectl --context ${context} apply -f cluster-${clusterName}-nodepool.yaml`}
        >
          <Text>As a result, a node pool will get created.</Text>
        </CLIGuideStep>
      </CLIGuideStepList>
    </CLIGuide>
  );
};

export default CreateNodePoolGuide;

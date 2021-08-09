import { Text } from 'grommet';
import * as docs from 'lib/docs';
import LoginGuideStep from 'MAPI/guides/LoginGuideStep';
import PropTypes from 'prop-types';
import React from 'react';
import { Providers } from 'shared/constants';
import { PropertiesOf } from 'shared/types';
import CLIGuide from 'UI/Display/MAPI/CLIGuide';
import CLIGuideAdditionalInfo from 'UI/Display/MAPI/CLIGuide/CLIGuideAdditionalInfo';
import CLIGuideStep from 'UI/Display/MAPI/CLIGuide/CLIGuideStep';
import CLIGuideStepList from 'UI/Display/MAPI/CLIGuide/CLIGuideStepList';

interface ICreateClusterGuideProps
  extends Omit<React.ComponentPropsWithoutRef<typeof CLIGuide>, 'title'> {
  provider: PropertiesOf<typeof Providers>;
  clusterName: string;
  organizationName: string;
}

const CreateClusterGuide: React.FC<ICreateClusterGuideProps> = ({
  provider,
  clusterName,
  organizationName,
  ...props
}) => {
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
              href: docs.clusterCRDSchemaURL,
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
          command={`
              kubectl gs template cluster \\
                --provider ${provider} \\
                --owner ${organizationName} \\
                --name ${clusterName} \\
                --output cluster-${clusterName}.yaml
          `}
        />
        <CLIGuideStep
          title='3. Apply the manifest'
          command={`
              kubectl apply -f cluster-${clusterName}.yaml
          `}
        >
          <Text>
            As a result, a cluster without worker nodes will get created.
          </Text>
        </CLIGuideStep>
      </CLIGuideStepList>
    </CLIGuide>
  );
};

CreateClusterGuide.propTypes = {
  provider: PropTypes.oneOf(Object.values(Providers)).isRequired,
  clusterName: PropTypes.string.isRequired,
  organizationName: PropTypes.string.isRequired,
};

export default CreateClusterGuide;

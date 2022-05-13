import { Text } from 'grommet';
import LoginGuideStep from 'MAPI/guides/LoginGuideStep';
import UnauthorizedMessage from 'MAPI/guides/UnauthorizedMessage';
import {
  getCurrentInstallationContextName,
  makeKubectlGSCommand,
  withFormatting,
  withLogin,
} from 'MAPI/guides/utils';
import * as docs from 'model/constants/docs';
import React from 'react';
import CLIGuide from 'UI/Display/MAPI/CLIGuide';
import CLIGuideAdditionalInfo from 'UI/Display/MAPI/CLIGuide/CLIGuideAdditionalInfo';
import CLIGuideStep from 'UI/Display/MAPI/CLIGuide/CLIGuideStep';
import CLIGuideStepList from 'UI/Display/MAPI/CLIGuide/CLIGuideStepList';

interface ICreateKeyPairGuideProps
  extends Omit<React.ComponentPropsWithoutRef<typeof CLIGuide>, 'title'> {
  clusterName: string;
  organizationName: string;
  canCreateKeyPairs?: boolean;
}

const CreateKeyPairGuide: React.FC<
  React.PropsWithChildren<ICreateKeyPairGuideProps>
> = ({ clusterName, organizationName, canCreateKeyPairs, ...props }) => {
  const context = getCurrentInstallationContextName();

  return (
    <CLIGuide
      title='Create a client certificate via the Management API'
      footer={
        <CLIGuideAdditionalInfo
          links={[
            {
              label: 'Management API introduction',
              href: docs.managementAPIIntroduction,
              external: true,
            },
            {
              label: 'kubectl gs login command reference',
              href: docs.kubectlGSLoginURL,
              external: true,
            },
          ]}
        />
      }
      {...props}
    >
      <CLIGuideStepList>
        {!canCreateKeyPairs && <UnauthorizedMessage />}
        <LoginGuideStep />
        <CLIGuideStep
          title='2. Create a client certificate'
          command={makeKubectlGSCommand(
            withLogin({
              managementCluster: context,
              workloadCluster: clusterName,
              workloadClusterOrganization: organizationName,
              certificateGroup: ['GROUP'],
              certificateTTL: '3h',
            }),
            withFormatting()
          )}
        />
        <Text>
          <strong>Note:</strong> To grant permissions to the client presenting
          the certificate, adapt <code>--certificate-group GROUP</code> to a
          name matched by a group subject in your RBAC role binding(s).
          Alternatively, you will have to create role bindings matching the
          unique user name (CN) of the generated client certificate.
        </Text>
        <Text>
          The flag <code>--certificate-ttl</code> is used to specify the
          lifetime of the certificate.
        </Text>
        <Text>
          On execution, your <code>kubectl</code> configuration file will be
          modified to set the required user, cluster, and context entries.
          Existing entries from previous executions will be overwritten.
        </Text>
      </CLIGuideStepList>
    </CLIGuide>
  );
};

export default CreateKeyPairGuide;

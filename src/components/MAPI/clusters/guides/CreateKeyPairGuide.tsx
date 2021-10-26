import { Text } from 'grommet';
import * as docs from 'lib/docs';
import LoginGuideStep from 'MAPI/guides/LoginGuideStep';
import {
  getCurrentInstallationContextName,
  makeKubectlGSCommand,
  withFormatting,
  withLogin,
} from 'MAPI/guides/utils';
import React from 'react';
import CLIGuide from 'UI/Display/MAPI/CLIGuide';
import CLIGuideAdditionalInfo from 'UI/Display/MAPI/CLIGuide/CLIGuideAdditionalInfo';
import CLIGuideStep from 'UI/Display/MAPI/CLIGuide/CLIGuideStep';
import CLIGuideStepList from 'UI/Display/MAPI/CLIGuide/CLIGuideStepList';

interface ICreateKeyPairGuideProps
  extends Omit<React.ComponentPropsWithoutRef<typeof CLIGuide>, 'title'> {
  clusterName: string;
  organizationName: string;
}

const CreateKeyPairGuide: React.FC<ICreateKeyPairGuideProps> = ({
  clusterName,
  organizationName,
  ...props
}) => {
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
        <LoginGuideStep />
        <CLIGuideStep
          title='2. Create a client certificate'
          command={makeKubectlGSCommand(
            withLogin({
              managementCluster: context,
              workloadCluster: clusterName,
              workloadClusterOrganization: organizationName,
              certificateGroup: ['my-group'],
              certificateTTL: '3h',
            }),
            withFormatting()
          )}
        />
        <Text>
          If you want to assign the certificate to one or several RBAC groups,
          apply <code>--certificate-group</code> as often as required with a
          proper group name. Otherwise remove it. Also adjust{' '}
          <code>--certificate-ttl</code> to the required life time.
        </Text>
        <Text>
          On execution, the required user, cluster, and context entries will be
          added/updated in your <code>kubectl</code> configuration file.
        </Text>
        <Text>
          <strong>Note:</strong> An existing cluster and user entry for the same
          workload cluster will get overwritten.
        </Text>
      </CLIGuideStepList>
    </CLIGuide>
  );
};

export default CreateKeyPairGuide;

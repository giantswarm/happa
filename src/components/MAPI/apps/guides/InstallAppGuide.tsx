import { Text } from 'grommet';
import LoginGuideStep from 'MAPI/guides/LoginGuideStep';
import UnauthorizedMessage from 'MAPI/guides/UnauthorizedMessage';
import { getCurrentInstallationContextName } from 'MAPI/guides/utils';
import * as docs from 'model/constants/docs';
import React from 'react';
import CLIGuide from 'UI/Display/MAPI/CLIGuide';
import CLIGuideAdditionalInfo from 'UI/Display/MAPI/CLIGuide/CLIGuideAdditionalInfo';
import CLIGuideStep from 'UI/Display/MAPI/CLIGuide/CLIGuideStep';
import CLIGuideStepList from 'UI/Display/MAPI/CLIGuide/CLIGuideStepList';

interface IInstallAppGuideProps
  extends Omit<React.ComponentPropsWithoutRef<typeof CLIGuide>, 'title'> {
  appName: string;
  catalogName: string;
  selectedVersion: string;
  canInstallApps?: boolean;
}

const InstallAppGuide: React.FC<IInstallAppGuideProps> = ({
  appName,
  catalogName,
  selectedVersion,
  canInstallApps,
  ...props
}) => {
  const context = getCurrentInstallationContextName();

  return (
    <CLIGuide
      title='Install this app via the Management API'
      footer={
        <CLIGuideAdditionalInfo
          links={[
            {
              label: 'kubectl gs plugin installation',
              href: docs.kubectlGSInstallationURL,
              external: true,
            },
            {
              label: 'kubectl gs template app command',
              href: docs.kubectlGSTemplateAppURL,
              external: true,
            },
            {
              label: 'App CRD schema',
              href: docs.crdSchemaURL(docs.crds.giantswarmio.app),
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
        {!canInstallApps && <UnauthorizedMessage />}
        <LoginGuideStep />
        <CLIGuideStep
          title='2. Create an app manifest'
          command={`
          kubectl gs template app \\
            --catalog ${catalogName} \\
            --name ${appName} \\
            --version ${selectedVersion} \\
            --cluster abc12 \\
            --namespace my-org \\
            > app.yaml
          `}
        >
          <Text>
            Replace <code>abc12</code> with the name of the workload cluster to
            install the app to. <code>my-org</code> must be replaced with the
            namespace to install the app to.
          </Text>
          <Text>
            To install a different version, set the value of the{' '}
            <code>--version</code> flag accordingly.
          </Text>
        </CLIGuideStep>
        <CLIGuideStep
          title='3. Apply the manifest'
          command={`
          kubectl --context ${context} apply -f app.yaml
          `}
        >
          <Text>
            As a result, the app will be installed in the workload cluster.
          </Text>
        </CLIGuideStep>
      </CLIGuideStepList>
    </CLIGuide>
  );
};

export default InstallAppGuide;

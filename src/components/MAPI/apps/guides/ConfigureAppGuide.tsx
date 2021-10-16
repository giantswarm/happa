import { Text } from 'grommet';
import * as docs from 'lib/docs';
import LoginGuideStep from 'MAPI/guides/LoginGuideStep';
import { getCurrentInstallationContextName } from 'MAPI/guides/utils';
import React from 'react';
import CLIGuide from 'UI/Display/MAPI/CLIGuide';
import CLIGuideAdditionalInfo from 'UI/Display/MAPI/CLIGuide/CLIGuideAdditionalInfo';
import CLIGuideStep from 'UI/Display/MAPI/CLIGuide/CLIGuideStep';
import CLIGuideStepList from 'UI/Display/MAPI/CLIGuide/CLIGuideStepList';

interface IConfigureAppGuideProps
  extends Omit<React.ComponentPropsWithoutRef<typeof CLIGuide>, 'title'> {
  appName: string;
  namespace: string;
}

const ConfigureAppGuide: React.FC<IConfigureAppGuideProps> = ({
  appName,
  namespace,
  ...props
}) => {
  const context = getCurrentInstallationContextName();

  return (
    <CLIGuide
      title='Update the configuration for this app via the Management API'
      footer={
        <CLIGuideAdditionalInfo
          links={[
            {
              label: 'kubectl gs plugin installation',
              href: docs.kubectlGSInstallationURL,
              external: true,
            },
            {
              label: 'App configuration',
              href: 'docs.appConfigurationURL',
              external: true,
            },
            {
              label: 'Getting started with the App Platform',
              href: docs.appPlatformURL,
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
        <LoginGuideStep />
        <CLIGuideStep
          title='2. Find your app configuration'
          command={`
          kubectl --context ${context} \\
            get apps ${appName} \\
            --namespace ${namespace} \\
            --output "jsonpath={.spec.userConfig}"
        `}
        >
          <Text>
            If the App resource has a user-defined configuration either in a
            secret, or in a configmap, or both, the resulting object will
            contain the name and namespace of these.
          </Text>
        </CLIGuideStep>
        <CLIGuideStep
          title='3. Modify the user-defined configmap or secret'
          command=''
        >
          <Text>
            Using the name and namespace information determined in step 2, you
            can locate the resources to be updated. Then use{' '}
            <code>kubectl apply</code> to make your configmap and/or secret
            changes effective.
          </Text>
          <Text>
            See our{' '}
            <a
              href={docs.appCRConfigurationURL}
              target='_blank'
              rel='noreferrer'
            >
              specific guide
            </a>{' '}
            for more detailed instructions.
          </Text>
        </CLIGuideStep>
      </CLIGuideStepList>
    </CLIGuide>
  );
};

export default ConfigureAppGuide;

import { Text } from 'grommet';
import LoginGuideStep from 'MAPI/guides/LoginGuideStep';
import { getCurrentInstallationContextName } from 'MAPI/guides/utils';
import * as docs from 'model/constants/docs';
import React from 'react';
import CLIGuide from 'UI/Display/MAPI/CLIGuide';
import CLIGuideAdditionalInfo from 'UI/Display/MAPI/CLIGuide/CLIGuideAdditionalInfo';
import CLIGuideStep from 'UI/Display/MAPI/CLIGuide/CLIGuideStep';
import CLIGuideStepList from 'UI/Display/MAPI/CLIGuide/CLIGuideStepList';

interface IInspectInstalledAppGuideProps
  extends Omit<React.ComponentPropsWithoutRef<typeof CLIGuide>, 'title'> {
  appName: string;
  namespace: string;
}

const InspectInstalledAppGuide: React.FC<
  React.PropsWithChildren<IInspectInstalledAppGuideProps>
> = ({ appName, namespace, ...props }) => {
  const context = getCurrentInstallationContextName();

  return (
    <CLIGuide
      title='Inspect this installed app via the Management API'
      footer={
        <CLIGuideAdditionalInfo
          links={[
            {
              label: 'kubectl gs plugin installation',
              href: docs.kubectlGSInstallationURL,
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
          title='2. Show app resource details'
          command={`
          kubectl --context ${context} --namespace ${namespace} describe apps ${appName}
          `}
        >
          <Text />
        </CLIGuideStep>
      </CLIGuideStepList>
    </CLIGuide>
  );
};

export default InspectInstalledAppGuide;

import { Text } from 'grommet';
import * as docs from 'lib/docs';
import LoginGuideStep from 'MAPI/guides/LoginGuideStep';
import { getCurrentInstallationContextName } from 'MAPI/guides/utils';
import React from 'react';
import CLIGuide from 'UI/Display/MAPI/CLIGuide';
import CLIGuideAdditionalInfo from 'UI/Display/MAPI/CLIGuide/CLIGuideAdditionalInfo';
import CLIGuideStep from 'UI/Display/MAPI/CLIGuide/CLIGuideStep';
import CLIGuideStepList from 'UI/Display/MAPI/CLIGuide/CLIGuideStepList';

interface IUpdateAppGuideProps
  extends Omit<React.ComponentPropsWithoutRef<typeof CLIGuide>, 'title'> {
  appName: string;
  namespace: string;
  newVersion: string;
  catalogName: string;
  catalogNamespace: string;
}

const UpdateAppGuide: React.FC<IUpdateAppGuideProps> = ({
  appName,
  namespace,
  newVersion,
  catalogName,
  catalogNamespace,
  ...props
}) => {
  const context = getCurrentInstallationContextName();

  return (
    <CLIGuide
      title='Update this app via the Management API'
      footer={
        <CLIGuideAdditionalInfo
          links={[
            {
              label: 'kubectl gs plugin installation',
              href: docs.kubectlGSInstallationURL,
              external: true,
            },
            {
              label: 'AppCatalogEntry CRD schema',
              href: docs.crdSchemaURL(docs.crds.giantswarmio.appCatalogEntry),
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
          title='2. Find out which versions are available for this app'
          command={`
          kubectl --context ${context} \\
            get appcatalogentries \\
            --selector application.giantswarm.io/catalog=${catalogName},app.kubernetes.io/name=${appName}${
            catalogNamespace
              ? ` \\
            --namespace ${catalogNamespace}`
              : ''
          }
          `}
        >
          <Text />
        </CLIGuideStep>
        <CLIGuideStep
          title={`3. Update this installed app's version`}
          command={`
          kubectl --context ${context} \\
            --namespace ${namespace} \\
            patch apps ${appName} \\
            --type merge \\
            --patch '{"spec": {"version": "${newVersion}"}}'
          `}
        >
          <Text />
        </CLIGuideStep>
      </CLIGuideStepList>
    </CLIGuide>
  );
};

export default UpdateAppGuide;

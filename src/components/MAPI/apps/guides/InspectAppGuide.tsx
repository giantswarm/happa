import { Text } from 'grommet';
import * as docs from 'lib/docs';
import LoginGuideStep from 'MAPI/guides/LoginGuideStep';
import { getCurrentInstallationContextName } from 'MAPI/guides/utils';
import React from 'react';
import CLIGuide from 'UI/Display/MAPI/CLIGuide';
import CLIGuideAdditionalInfo from 'UI/Display/MAPI/CLIGuide/CLIGuideAdditionalInfo';
import CLIGuideStep from 'UI/Display/MAPI/CLIGuide/CLIGuideStep';
import CLIGuideStepList from 'UI/Display/MAPI/CLIGuide/CLIGuideStepList';

interface IInspectAppGuideProps
  extends Omit<React.ComponentPropsWithoutRef<typeof CLIGuide>, 'title'> {
  appName: string;
  catalogName: string;
  catalogNamespace?: string;
  selectedVersion: string;
}

const InspectAppGuide: React.FC<IInspectAppGuideProps> = ({
  appName,
  catalogName,
  catalogNamespace,
  selectedVersion,
  ...props
}) => {
  const context = getCurrentInstallationContextName();

  return (
    <CLIGuide
      title='Inspect this app via the Management API'
      footer={
        <CLIGuideAdditionalInfo
          links={[
            {
              label: 'AppCatalogEntry CRD schema',
              href: docs.crdSchemaURL(docs.crds.giantswarmio.appCatalogEntry),
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
          title='2. Show available app versions'
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
          <Text>
            To list versions available for installation, you&apos;ll want to
            find <code>AppCatalogEntry</code> resources.
          </Text>
          <Text>
            Here the <code>--selector</code>
            values ensure that only entries from catalog{' '}
            <code>{catalogName}</code>
            with app name <code>{appName}</code> are returned.
          </Text>
        </CLIGuideStep>
        <CLIGuideStep
          title='3. Show app details'
          command={`
          kubectl --context ${context} \\
            describe appcatalogentries \\
            ${catalogName}-${appName}-${selectedVersion}${
            catalogNamespace
              ? ` \\
            --namespace ${catalogNamespace}`
              : ''
          }
          `}
        >
          <Text>
            To show details for an app that is not installed, in a specific
            version, you&apos;ll have to inspect the{' '}
            <code>AppCatalogEntry</code> resource for that app.
          </Text>
        </CLIGuideStep>
      </CLIGuideStepList>
    </CLIGuide>
  );
};

export default InspectAppGuide;

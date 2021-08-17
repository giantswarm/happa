import { Text } from 'grommet';
import * as docs from 'lib/docs';
import LoginGuideStep from 'MAPI/guides/LoginGuideStep';
import {
  getCurrentInstallationContextName,
  makeKubectlGSCommand,
  withContext,
  withFormatting,
  withGetApps,
} from 'MAPI/guides/utils';
import PropTypes from 'prop-types';
import React from 'react';
import { useSelector } from 'react-redux';
import CLIGuide from 'UI/Display/MAPI/CLIGuide';
import CLIGuideAdditionalInfo from 'UI/Display/MAPI/CLIGuide/CLIGuideAdditionalInfo';
import CLIGuideStep from 'UI/Display/MAPI/CLIGuide/CLIGuideStep';
import CLIGuideStepList from 'UI/Display/MAPI/CLIGuide/CLIGuideStepList';

interface IListAppsGuideProps
  extends Omit<React.ComponentPropsWithoutRef<typeof CLIGuide>, 'title'> {
  namespace: string;
}

const ListAppsGuide: React.FC<IListAppsGuideProps> = ({
  namespace,
  ...props
}) => {
  const context = useSelector(getCurrentInstallationContextName);

  return (
    <CLIGuide
      title='List installed apps via the Management API'
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
              href: docs.crdSchemaURL('apps.application.giantswarm.io'),
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
          title='2. List installed apps'
          command={makeKubectlGSCommand(
            withContext(context),
            withGetApps({
              namespace: namespace,
            }),
            withFormatting()
          )}
        >
          <Text>
            As a result, you will get a list of all <code>App</code> resources
            representing apps installed in this cluster. You can append the flag{' '}
            <code>--output json</code> for full, machine-readable information.
          </Text>
        </CLIGuideStep>
      </CLIGuideStepList>
    </CLIGuide>
  );
};

ListAppsGuide.propTypes = {
  namespace: PropTypes.string.isRequired,
};

export default ListAppsGuide;

import { Box, Text } from 'grommet';
import * as docs from 'lib/docs';
import LoginGuideStep from 'MAPI/guides/LoginGuideStep';
import PropTypes from 'prop-types';
import React from 'react';
import CLIGuide from 'UI/Display/MAPI/CLIGuide';
import CLIGuideAdditionalInfo from 'UI/Display/MAPI/CLIGuide/CLIGuideAdditionalInfo';
import CLIGuideStep from 'UI/Display/MAPI/CLIGuide/CLIGuideStep';

interface IListRolesGuideProps
  extends Omit<React.ComponentPropsWithoutRef<typeof CLIGuide>, 'title'> {
  namespace: string;
}

const ListRolesGuide: React.FC<IListRolesGuideProps> = ({
  namespace,
  ...props
}) => {
  return (
    <CLIGuide
      title='List roles via the Management API'
      footer={
        <CLIGuideAdditionalInfo
          links={[
            {
              label: 'kubectl gs plugin installation',
              href: docs.kubectlGSInstallationURL,
              external: true,
            },
            {
              label: 'kubectl gs login command',
              href: docs.kubectlGSLoginURL,
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
      <Box direction='column' gap='small'>
        <LoginGuideStep />
        <CLIGuideStep
          title='2. List cluster roles'
          command='kubectl get clusterroles -l ui.giantswarm.io/display=true'
        >
          <Text>
            As a result, you will get a list of <code>ClusterRole</code>{' '}
            resources that should resemble the list you see in the web UI.
          </Text>
          <Text>
            <strong>Tip:</strong> remove the{' '}
            <code>-l ui.giantswarm.io/display=true</code> label to find a lot
            more cluster roles.
          </Text>
        </CLIGuideStep>
        <CLIGuideStep
          title={`3. List roles in the organization's namespace`}
          command={`kubectl get roles -n ${namespace}`}
        />
      </Box>
    </CLIGuide>
  );
};

ListRolesGuide.propTypes = {
  namespace: PropTypes.string.isRequired,
};

export default ListRolesGuide;

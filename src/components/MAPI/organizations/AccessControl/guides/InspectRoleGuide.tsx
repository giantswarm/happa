import { Box, Text } from 'grommet';
import * as docs from 'lib/docs';
import LoginGuideStep from 'MAPI/guides/LoginGuideStep';
import PropTypes from 'prop-types';
import React from 'react';
import CLIGuide from 'UI/Display/MAPI/CLIGuide';
import CLIGuideAdditionalInfo from 'UI/Display/MAPI/CLIGuide/CLIGuideAdditionalInfo';
import CLIGuideStep from 'UI/Display/MAPI/CLIGuide/CLIGuideStep';

interface IInspectRoleGuideProps
  extends Omit<React.ComponentPropsWithoutRef<typeof CLIGuide>, 'title'> {
  namespace: string;
}

const InspectRoleGuide: React.FC<IInspectRoleGuideProps> = ({
  namespace,
  ...props
}) => {
  return (
    <CLIGuide
      title='Inspect a role via the Management API'
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
          title='2. Inspect a cluster role'
          command='kubectl describe clusterrole read-all'
        >
          <Text>
            <strong>Note:</strong> Replace <code>read-all</code> with the name
            of the <code>ClusterRole</code> you want to inspect.
          </Text>
        </CLIGuideStep>
        <CLIGuideStep
          title={`3. Inspect a role in the organization's namespace`}
          command={`kubectl describe role read-all -n ${namespace}`}
        >
          <Text>
            <strong>Note:</strong> Replace <code>read-all</code> with the name
            of the <code>Role</code> you want to inspect.
          </Text>
        </CLIGuideStep>
        <CLIGuideStep
          title='4. Find which (cluster) role bindings reference a ClusterRole'
          command='kubectl get rolebindings,clusterrolebindings -A | grep ClusterRole/cluster-admin'
        >
          <Text>
            <strong>Note:</strong> Replace <code>cluster-admin</code> with the
            name of the <code>ClusterRole</code> you want to inspect.
          </Text>
        </CLIGuideStep>
        <CLIGuideStep
          title='5. Find which role bindings reference a Role'
          command={`kubectl get rolebindings -n ${namespace} | grep Role/example`}
        >
          <Text>
            <strong>Note:</strong> Replace <code>example</code> with the name of
            the <code>Role</code> you want to inspect.
          </Text>
        </CLIGuideStep>
      </Box>
    </CLIGuide>
  );
};

InspectRoleGuide.propTypes = {
  namespace: PropTypes.string.isRequired,
};

export default InspectRoleGuide;

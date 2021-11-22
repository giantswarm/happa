import { Text } from 'grommet';
import LoginGuideStep from 'MAPI/guides/LoginGuideStep';
import * as docs from 'model/constants/docs';
import React from 'react';
import CLIGuide from 'UI/Display/MAPI/CLIGuide';
import CLIGuideAdditionalInfo from 'UI/Display/MAPI/CLIGuide/CLIGuideAdditionalInfo';
import CLIGuideStep from 'UI/Display/MAPI/CLIGuide/CLIGuideStep';
import CLIGuideStepList from 'UI/Display/MAPI/CLIGuide/CLIGuideStepList';

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
      <CLIGuideStepList>
        <LoginGuideStep />
        <CLIGuideStep
          title={
            <>
              2. List <code>ClusterRole</code> resources
            </>
          }
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
          title={
            <>
              3. List <code>Role</code> resources in the organization&apos;s
              namespace
            </>
          }
          command={`kubectl get roles -n ${namespace} -l ui.giantswarm.io/display=true`}
        />
      </CLIGuideStepList>
    </CLIGuide>
  );
};

export default ListRolesGuide;

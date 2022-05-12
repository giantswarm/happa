import { Text } from 'grommet';
import LoginGuideStep from 'MAPI/guides/LoginGuideStep';
import * as docs from 'model/constants/docs';
import React from 'react';
import CLIGuide from 'UI/Display/MAPI/CLIGuide';
import CLIGuideAdditionalInfo from 'UI/Display/MAPI/CLIGuide/CLIGuideAdditionalInfo';
import CLIGuideStep from 'UI/Display/MAPI/CLIGuide/CLIGuideStep';
import CLIGuideStepList from 'UI/Display/MAPI/CLIGuide/CLIGuideStepList';

interface IInspectRoleGuideProps
  extends Omit<React.ComponentPropsWithoutRef<typeof CLIGuide>, 'title'> {
  namespace: string;
}

const InspectRoleGuide: React.FC<
  React.PropsWithChildren<IInspectRoleGuideProps>
> = ({ namespace, ...props }) => {
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
      <CLIGuideStepList>
        <LoginGuideStep />
        <CLIGuideStep
          title={
            <>
              2. Inspect a <code>ClusterRole</code> resource
            </>
          }
          command='kubectl describe clusterrole read-all'
        >
          <Text>
            <strong>Note:</strong> Replace <code>read-all</code> with the name
            of the <code>ClusterRole</code> you want to inspect.
          </Text>
        </CLIGuideStep>
        <CLIGuideStep
          title={
            <>
              3. Inspect a <code>Role</code> resource in the organization&apos;s
              namespace
            </>
          }
          command={`kubectl describe role read-all --namespace ${namespace}`}
        >
          <Text>
            <strong>Note:</strong> Replace <code>read-all</code> with the name
            of the <code>Role</code> you want to inspect.
          </Text>
        </CLIGuideStep>
        <CLIGuideStep
          title={
            <>
              4. Find which <code>ClusterRoleBinding</code> or{' '}
              <code>RoleBinding</code> references a <code>ClusterRole</code>
            </>
          }
          command='kubectl get rolebindings,clusterrolebindings --all-namespaces | grep ClusterRole/cluster-admin'
        >
          <Text>
            <strong>Note:</strong> Replace <code>cluster-admin</code> with the
            name of the <code>ClusterRole</code> you want to inspect.
          </Text>
        </CLIGuideStep>
        <CLIGuideStep
          title={
            <>
              5. Find which <code>RoleBinding</code> resources reference a{' '}
              <code>Role</code>
            </>
          }
          command={`kubectl get rolebindings --namespace ${namespace} | grep Role/example`}
        >
          <Text>
            <strong>Note:</strong> Replace <code>example</code> with the name of
            the <code>Role</code> you want to inspect.
          </Text>
        </CLIGuideStep>
      </CLIGuideStepList>
    </CLIGuide>
  );
};

export default InspectRoleGuide;

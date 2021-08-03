import { Text } from 'grommet';
import * as docs from 'lib/docs';
import LoginGuideStep from 'MAPI/guides/LoginGuideStep';
import PropTypes from 'prop-types';
import React from 'react';
import CLIGuide from 'UI/Display/MAPI/CLIGuide';
import CLIGuideAdditionalInfo from 'UI/Display/MAPI/CLIGuide/CLIGuideAdditionalInfo';
import CLIGuideStep from 'UI/Display/MAPI/CLIGuide/CLIGuideStep';
import CLIGuideStepList from 'UI/Display/MAPI/CLIGuide/CLIGuideStepList';

interface IBindRolesToSubjectsGuideProps
  extends Omit<React.ComponentPropsWithoutRef<typeof CLIGuide>, 'title'> {
  namespace: string;
}

const BindRolesToSubjectsGuide: React.FC<IBindRolesToSubjectsGuideProps> = ({
  namespace,
  ...props
}) => {
  return (
    <CLIGuide
      title='Bind roles to subjects via the Management API'
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
              label: 'kubectl create rolebinding command',
              href: docs.kubectlCreateRoleBindingURL,
              external: true,
            },
            {
              label: 'kubectl create clusterrolebinding command',
              href: docs.kubectlCreateClusterRoleBindingURL,
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
          title='2. Bind a Role to a user or group to grant access to resources of this organization'
          command={`kubectl create rolebinding example \\
          -n ${namespace} --user example@acme.org --role read-all`}
        >
          <Text>
            <strong>Note:</strong> Replace <code>example</code> with a unique
            name for the <code>RoleBinding</code>. Replace{' '}
            <code>example@acme.org</code> with the actual user&apos;s ID and{' '}
            <code>read-all</code> with the name of the <code>Role</code> you
            want to bind. Be aware that the role must exist in this namespace
          </Text>
          <Text>
            In order to grant access to a <strong>group</strong> of users, use
            the <code>--group</code> flag instead of the <code>--user</code>{' '}
            flag.
          </Text>
        </CLIGuideStep>
        <CLIGuideStep
          title='3. Bind a ClusterRole to a user or group to grant access to resources of this organization'
          command={`kubectl create rolebinding example \\
           -n ${namespace} --user example@acme.org --clusterrole read-all`}
        >
          <Text>
            <strong>Note:</strong> Replace <code>example</code> with a unique
            name for the <code>RoleBinding</code>. Replace{' '}
            <code>example@acme.org</code> with the actual user&apos;s ID and{' '}
            <code>read-all</code> with the name of the <code>ClusterRole</code>{' '}
            you want to bind.
          </Text>
          <Text>
            In order to grant access to a <strong>group</strong> of users, use
            the <code>--group</code> flag instead of the <code>--user</code>{' '}
            flag.
          </Text>
        </CLIGuideStep>
        <CLIGuideStep
          title='4. Bind a Role or ClusterRole to a ServiceAccount to grant access to resources of this organization'
          command={`kubectl create rolebinding example \\
          -n ${namespace} --serviceaccount ${namespace}:my-sa --role read-all`}
        >
          <Text>
            <strong>Note:</strong> Replace <code>example</code> with a unique
            name for the <code>RoleBinding</code>. Replace <code>my-sa</code>{' '}
            with the name of the <code>ServiceAccount</code> and{' '}
            <code>read-all</code> with the name of the <code>Role</code> you
            want to bind. Be aware that the role must exist in this namespace.
          </Text>
          <Text>
            In order to bind the <code>ServiceAccount</code> to a{' '}
            <code>ClusterRole</code> instead of a <code>Role</code>, use the{' '}
            <code>--clusterrole</code> flag instead of <code>--role</code>.
          </Text>
        </CLIGuideStep>
      </CLIGuideStepList>
    </CLIGuide>
  );
};

BindRolesToSubjectsGuide.propTypes = {
  namespace: PropTypes.string.isRequired,
};

export default BindRolesToSubjectsGuide;

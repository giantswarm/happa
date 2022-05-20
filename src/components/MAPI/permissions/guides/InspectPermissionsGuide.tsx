import { Text } from 'grommet';
import LoginGuideStep from 'MAPI/guides/LoginGuideStep';
import { getCurrentInstallationContextName } from 'MAPI/guides/utils';
import * as docs from 'model/constants/docs';
import React from 'react';
import CLIGuide from 'UI/Display/MAPI/CLIGuide';
import CLIGuideAdditionalInfo from 'UI/Display/MAPI/CLIGuide/CLIGuideAdditionalInfo';
import CLIGuideStep from 'UI/Display/MAPI/CLIGuide/CLIGuideStep';
import CLIGuideStepList from 'UI/Display/MAPI/CLIGuide/CLIGuideStepList';

import { SubjectType } from '../SubjectForm';

interface IInspectPermissionsGuideProps
  extends Omit<React.ComponentPropsWithoutRef<typeof CLIGuide>, 'title'> {
  forOrganizations: boolean;
  subjectName?: string;
  subjectType?: SubjectType;
}

const InspectPermissionsGuide: React.FC<IInspectPermissionsGuideProps> = ({
  forOrganizations,
  subjectName,
  subjectType = SubjectType.Myself,
  ...props
}) => {
  const context = getCurrentInstallationContextName();

  const currentSubjectType =
    subjectType === SubjectType.User
      ? 'for a user'
      : subjectType === SubjectType.Group
      ? 'for a group'
      : '';

  const currentSubjectPossessive =
    subjectType === SubjectType.User ? (
      <>
        user <code>{subjectName}</code> has
      </>
    ) : subjectType === SubjectType.Group ? (
      <>
        a member of group <code>{subjectName}</code> has
      </>
    ) : (
      `you have`
    );

  const impersonationFlags =
    subjectType === SubjectType.User
      ? ` \\\n  --as ${subjectName}`
      : subjectType === SubjectType.Group
      ? ` \\\n  --as example@acme.org --as-group ${subjectName}`
      : '';

  return (
    <CLIGuide
      title='Inspect permissions via the Management API'
      footer={
        <CLIGuideAdditionalInfo
          links={[
            {
              label: 'kubectl gs plugin installation',
              href: docs.kubectlGSInstallationURL,
              external: true,
            },
            {
              label: 'kubectl gs login listCommand',
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
          title={`
              2. Inspect permissions ${currentSubjectType}
              ${forOrganizations ? ` in an organization's namespace` : ''}`}
          command={`kubectl --context ${context} \\\n  auth can-i --list${
            forOrganizations ? ` \\\n  --namespace org-ORGANIZATION` : ''
          }${impersonationFlags}`}
        >
          {forOrganizations && (
            <Text>
              <strong>Note: </strong>Replace <code>ORGANIZATION</code> with the
              name of the organization.
            </Text>
          )}
          <Text>
            As a result, you will get a list of resources and the permissions{' '}
            {currentSubjectPossessive} for each resource in the{' '}
            <code>{forOrganizations ? 'org-ORGANIZATION' : 'default'}</code>{' '}
            namespace.
          </Text>
        </CLIGuideStep>
        <CLIGuideStep
          title={`
              3. Inspect access to a resource ${currentSubjectType}
              ${forOrganizations ? ` in an organization's namespace` : ''}`}
          command={`kubectl --context ${context} \\\n  auth can-i VERB RESOURCE${
            forOrganizations
              ? ` \\\n  --namespace org-ORGANIZATION`
              : ' \\\n  --all-namespaces'
          }${impersonationFlags}`}
        >
          <Text>
            <strong>Note: </strong>Replace <code>VERB</code> with a Kubernetes
            API request verb (e.g. <code>get</code>) and <code>RESOURCE</code>{' '}
            with the name of the resource type.
          </Text>
          <Text>
            As a result, you will get a <code>yes</code> or <code>no</code>{' '}
            output indicating access with the specified verb to the resource in{' '}
            {forOrganizations ? (
              <>
                the <code>org-ORGANIZATION</code> namespace.
              </>
            ) : (
              <>
                all namespaces. This command also works for non-namespaced
                resources.
              </>
            )}
          </Text>
        </CLIGuideStep>
      </CLIGuideStepList>
    </CLIGuide>
  );
};

export default InspectPermissionsGuide;

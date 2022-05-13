import { Text } from 'grommet';
import LoginGuideStep from 'MAPI/guides/LoginGuideStep';
import UnauthorizedMessage from 'MAPI/guides/UnauthorizedMessage';
import * as docs from 'model/constants/docs';
import React from 'react';
import CLIGuide from 'UI/Display/MAPI/CLIGuide';
import CLIGuideAdditionalInfo from 'UI/Display/MAPI/CLIGuide/CLIGuideAdditionalInfo';
import CLIGuideStep from 'UI/Display/MAPI/CLIGuide/CLIGuideStep';
import CLIGuideStepList from 'UI/Display/MAPI/CLIGuide/CLIGuideStepList';

interface IDeleteOrganizationGuideProps
  extends Omit<React.ComponentPropsWithoutRef<typeof CLIGuide>, 'title'> {
  organizationName: string;
  canDeleteOrganization?: boolean;
}

const DeleteOrganizationGuide: React.FC<
  React.PropsWithChildren<IDeleteOrganizationGuideProps>
> = ({ organizationName, canDeleteOrganization, ...props }) => {
  return (
    <CLIGuide
      title='Delete this organization via the Management API'
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
        {!canDeleteOrganization && <UnauthorizedMessage />}
        <LoginGuideStep />
        <CLIGuideStep
          title='2. Delete the organization'
          command={`kubectl delete organization ${organizationName}`}
        >
          <Text>
            As a result, the organization and the associated namespace including
            all resources in that namespace will be deleted.
          </Text>
          <Text>
            <strong>Note:</strong> if there are any clusters associated with the
            organization via the label{' '}
            <code>giantswarm.io/organization={organizationName}</code>, the
            organization will not be deleted. Also the existence of a cloud
            provider credentials secret for this organization will prevent
            deletion.
          </Text>
        </CLIGuideStep>
      </CLIGuideStepList>
    </CLIGuide>
  );
};

export default DeleteOrganizationGuide;

import { Text } from 'grommet';
import * as docs from 'lib/docs';
import LoginGuideStep from 'MAPI/guides/LoginGuideStep';
import PropTypes from 'prop-types';
import React from 'react';
import CLIGuide from 'UI/Display/MAPI/CLIGuide';
import CLIGuideAdditionalInfo from 'UI/Display/MAPI/CLIGuide/CLIGuideAdditionalInfo';
import CLIGuideStep from 'UI/Display/MAPI/CLIGuide/CLIGuideStep';
import CLIGuideStepList from 'UI/Display/MAPI/CLIGuide/CLIGuideStepList';

interface IDeleteOrganizationGuideProps
  extends Omit<React.ComponentPropsWithoutRef<typeof CLIGuide>, 'title'> {
  organizationName: string;
}

const DeleteOrganizationGuide: React.FC<IDeleteOrganizationGuideProps> = ({
  organizationName,
  ...props
}) => {
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
        <LoginGuideStep />
        <CLIGuideStep
          title='2. Delete the organization'
          command={`kubectl delete organization ${organizationName}`}
        >
          <Text>
            As a result, the organization and the associated namespace will be
            deleted, if possible.
          </Text>
        </CLIGuideStep>
      </CLIGuideStepList>
    </CLIGuide>
  );
};

DeleteOrganizationGuide.propTypes = {
  organizationName: PropTypes.string.isRequired,
};

export default DeleteOrganizationGuide;

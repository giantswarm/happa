import { Text } from 'grommet';
import LoginGuideStep from 'MAPI/guides/LoginGuideStep';
import UnauthorizedMessage from 'MAPI/guides/UnauthorizedMessage';
import {
  getCurrentInstallationContextName,
  makeKubectlGSCommand,
  withTemplateOrganization,
} from 'MAPI/guides/utils';
import * as docs from 'model/constants/docs';
import React from 'react';
import { useSelector } from 'react-redux';
import CLIGuide from 'UI/Display/MAPI/CLIGuide';
import CLIGuideAdditionalInfo from 'UI/Display/MAPI/CLIGuide/CLIGuideAdditionalInfo';
import CLIGuideStep from 'UI/Display/MAPI/CLIGuide/CLIGuideStep';
import CLIGuideStepList from 'UI/Display/MAPI/CLIGuide/CLIGuideStepList';

interface ICreateOrganizationsGuidProps
  extends Omit<React.ComponentPropsWithoutRef<typeof CLIGuide>, 'title'> {
  canCreateOrganizations?: boolean;
}

const CreateOrganizationGuide: React.FC<
  React.PropsWithChildren<ICreateOrganizationsGuidProps>
> = ({ canCreateOrganizations, ...props }) => {
  const context = useSelector(getCurrentInstallationContextName);

  return (
    <CLIGuide
      title='Create an organization via the Management API'
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
              label: 'Organization CRD schema',
              href: docs.crdSchemaURL(docs.crds.giantswarmio.organization),
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
        {!canCreateOrganizations && <UnauthorizedMessage />}
        <LoginGuideStep />
        <CLIGuideStep
          title='2. Create an organization manifest'
          command={makeKubectlGSCommand(
            withTemplateOrganization({
              name: 'example',
              output: 'example-organization.yaml',
            })
          )}
        >
          <Text>
            <strong>Note:</strong> please replace <code>example</code> with your
            intended organization name.
          </Text>
        </CLIGuideStep>
        <CLIGuideStep
          title='3. Apply the manifest'
          command={`kubectl --context ${context} apply --filename example-organization.yaml`}
        >
          <Text>
            As a result, the CR and the according namespace will get created.
          </Text>
        </CLIGuideStep>
      </CLIGuideStepList>
    </CLIGuide>
  );
};

export default CreateOrganizationGuide;

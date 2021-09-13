import { Text } from 'grommet';
import * as docs from 'lib/docs';
import LoginGuideStep from 'MAPI/guides/LoginGuideStep';
import { getCurrentInstallationContextName } from 'MAPI/guides/utils';
import React from 'react';
import { useSelector } from 'react-redux';
import CLIGuide from 'UI/Display/MAPI/CLIGuide';
import CLIGuideAdditionalInfo from 'UI/Display/MAPI/CLIGuide/CLIGuideAdditionalInfo';
import CLIGuideStep from 'UI/Display/MAPI/CLIGuide/CLIGuideStep';
import CLIGuideStepList from 'UI/Display/MAPI/CLIGuide/CLIGuideStepList';

interface ICreateOrganizationsGuidProps
  extends Omit<React.ComponentPropsWithoutRef<typeof CLIGuide>, 'title'> {}

const CreateOrganizationGuide: React.FC<ICreateOrganizationsGuidProps> = (
  props
) => {
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
        <LoginGuideStep />
        <CLIGuideStep
          title='2. Create an organization manifest'
          command={`
              kubectl template organization \
                --name example \
                > example-organization.yaml
          `}
        >
          <Text>
            <strong>Note:</strong> please replace <code>example</code> with your
            intended organization name.
          </Text>
          <Text>
            As a result, the new <code>Organization</code> CR has been created.
            In addition, there will be a new namespace named{' '}
            <code>org-example</code> (where <code>example</code> represents your
            chosen name) to be used for the resources of this organization.
          </Text>
        </CLIGuideStep>
        <CLIGuideStep
          title='3. Apply the manifest'
          command={`kubectl --context ${context} apply -f example-organization.yaml`}
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

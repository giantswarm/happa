import { Text } from 'grommet';
import * as docs from 'lib/docs';
import LoginGuideStep from 'MAPI/guides/LoginGuideStep';
import React from 'react';
import CLIGuide from 'UI/Display/MAPI/CLIGuide';
import CLIGuideAdditionalInfo from 'UI/Display/MAPI/CLIGuide/CLIGuideAdditionalInfo';
import CLIGuideStep from 'UI/Display/MAPI/CLIGuide/CLIGuideStep';
import CLIGuideStepList from 'UI/Display/MAPI/CLIGuide/CLIGuideStepList';

interface IListOrganizationsGuideProps
  extends Omit<React.ComponentPropsWithoutRef<typeof CLIGuide>, 'title'> {}

const ListOrganizationsGuide: React.FC<IListOrganizationsGuideProps> = (
  props
) => {
  return (
    <CLIGuide
      title='List organizations via the Management API'
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
          title='2. List organizations'
          command='kubectl get organizations'
        >
          <Text>
            As a result, you will get a list of all organizations to which you
            are permitted some sort of access.
          </Text>
        </CLIGuideStep>
      </CLIGuideStepList>
    </CLIGuide>
  );
};

export default ListOrganizationsGuide;

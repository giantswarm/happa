import { Text } from 'grommet';
import * as docs from 'lib/docs';
import LoginGuideStep from 'MAPI/guides/LoginGuideStep';
import React from 'react';
import CLIGuide from 'UI/Display/MAPI/CLIGuide';
import CLIGuideAdditionalInfo from 'UI/Display/MAPI/CLIGuide/CLIGuideAdditionalInfo';
import CLIGuideStep from 'UI/Display/MAPI/CLIGuide/CLIGuideStep';
import CLIGuideStepList from 'UI/Display/MAPI/CLIGuide/CLIGuideStepList';

interface IListAppCatalogsGuideProps
  extends Omit<React.ComponentPropsWithoutRef<typeof CLIGuide>, 'title'> {}

const ListAppCatalogsGuide: React.FC<IListAppCatalogsGuideProps> = ({
  ...props
}) => {
  return (
    <CLIGuide
      title='List app catalogs via the Management API'
      footer={
        <CLIGuideAdditionalInfo
          links={[
            {
              label: 'kubectl gs plugin installation',
              href: docs.kubectlGSInstallationURL,
              external: true,
            },
            {
              label: 'kubectl gs get catalogs command',
              href: docs.kubectlGSGetCatalogsURL,
              external: true,
            },
            {
              label: 'Catalog CRD schema',
              href: docs.crdSchemaURL(docs.crds.giantswarmio.catalog),
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
          title='2. List catalogs'
          command='kubectl gs get catalogs'
        >
          <Text>
            This will list app catalogs in the <code>default</code> namespace.
            To list catalogs in other namespaces, add{' '}
            <code>{'--namespace <namespace>'}</code>.
          </Text>
        </CLIGuideStep>
      </CLIGuideStepList>
    </CLIGuide>
  );
};

export default ListAppCatalogsGuide;

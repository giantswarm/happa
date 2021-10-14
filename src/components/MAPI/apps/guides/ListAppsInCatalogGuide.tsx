import { Text } from 'grommet';
import * as docs from 'lib/docs';
import LoginGuideStep from 'MAPI/guides/LoginGuideStep';
import React from 'react';
import CLIGuide from 'UI/Display/MAPI/CLIGuide';
import CLIGuideAdditionalInfo from 'UI/Display/MAPI/CLIGuide/CLIGuideAdditionalInfo';
import CLIGuideStep from 'UI/Display/MAPI/CLIGuide/CLIGuideStep';
import CLIGuideStepList from 'UI/Display/MAPI/CLIGuide/CLIGuideStepList';

interface IListAppsInCatalogGuideProps
  extends Omit<React.ComponentPropsWithoutRef<typeof CLIGuide>, 'title'> {}

const ListAppsInCatalogGuide: React.FC<IListAppsInCatalogGuideProps> = ({
  ...props
}) => {
  return (
    <CLIGuide
      title='List apps via the Management API'
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
          title='2. List apps available in a catalog'
          command='kubectl gs get catalogs giantswarm'
        >
          <Text>
            This lists apps in the <code>giantswarm</code> catalog with their
            latest releases.
          </Text>
          <Text>
            To see apps from other catalogs, replace <code>giantswarm</code>{' '}
            with the name of the catalog. Add a <code>--namespace</code> flag in
            case your catalog is situated in a namespace other than{' '}
            <code>default</code>.
          </Text>
        </CLIGuideStep>
      </CLIGuideStepList>
    </CLIGuide>
  );
};

export default ListAppsInCatalogGuide;

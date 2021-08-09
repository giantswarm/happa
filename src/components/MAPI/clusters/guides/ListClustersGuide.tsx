import { Text } from 'grommet';
import * as docs from 'lib/docs';
import LoginGuideStep from 'MAPI/guides/LoginGuideStep';
import React from 'react';
import CLIGuide from 'UI/Display/MAPI/CLIGuide';
import CLIGuideAdditionalInfo from 'UI/Display/MAPI/CLIGuide/CLIGuideAdditionalInfo';
import CLIGuideStep from 'UI/Display/MAPI/CLIGuide/CLIGuideStep';
import CLIGuideStepList from 'UI/Display/MAPI/CLIGuide/CLIGuideStepList';

interface IListClustersGuideProps
  extends Omit<React.ComponentPropsWithoutRef<typeof CLIGuide>, 'title'> {}

const ListClustersGuide: React.FC<IListClustersGuideProps> = (props) => {
  return (
    <CLIGuide
      title='List clusters via the Management API'
      footer={
        <CLIGuideAdditionalInfo
          links={[
            {
              label: 'kubectl gs plugin installation',
              href: docs.kubectlGSInstallationURL,
              external: true,
            },
            {
              label: 'kubectl gs get clusters command',
              href: docs.kubectlGSGetClustersURL,
              external: true,
            },
            {
              label: 'Cluster CRD schema',
              href: docs.clusterCRDSchemaURL,
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
          title='2. List all clusters'
          command='kubectl gs get clusters --all-namespaces'
        >
          <Text>
            <strong>Note:</strong> The above command prints a user-friendly
            table. Add <code>--output json</code> to create JSON output instead.
          </Text>
        </CLIGuideStep>
      </CLIGuideStepList>
    </CLIGuide>
  );
};

ListClustersGuide.propTypes = {};

export default ListClustersGuide;

import { Text } from 'grommet';
import * as docs from 'lib/docs';
import LoginGuideStep from 'MAPI/guides/LoginGuideStep';
import { getCurrentInstallationContextName } from 'MAPI/guides/utils';
import { Providers } from 'model/constants';
import React from 'react';
import CLIGuide from 'UI/Display/MAPI/CLIGuide';
import CLIGuideAdditionalInfo from 'UI/Display/MAPI/CLIGuide/CLIGuideAdditionalInfo';
import CLIGuideStep from 'UI/Display/MAPI/CLIGuide/CLIGuideStep';
import CLIGuideStepList from 'UI/Display/MAPI/CLIGuide/CLIGuideStepList';

interface ISetClusterLabelsGuideProps
  extends Omit<React.ComponentPropsWithoutRef<typeof CLIGuide>, 'title'> {
  clusterName: string;
  clusterNamespace: string;
  provider: PropertiesOf<typeof Providers>;
}

const SetClusterLabelsGuide: React.FC<ISetClusterLabelsGuideProps> = ({
  clusterName,
  clusterNamespace,
  provider,
  ...props
}) => {
  const context = getCurrentInstallationContextName();

  return (
    <CLIGuide
      title='Set cluster labels via the Management API'
      footer={
        <CLIGuideAdditionalInfo
          links={[
            {
              label: 'kubectl gs plugin installation',
              href: docs.kubectlGSInstallationURL,
              external: true,
            },
            {
              label: 'Cluster CRD schema',
              href: docs.crdSchemaURL(docs.crds.xk8sio.cluster),
              external: true,
            },
            {
              label: 'Labelling workload clusters',
              href: docs.labellingWorkloadClustersURL,
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
          title='2. Add a label to this cluster'
          command={`
          kubectl --context ${context} \\
            patch ${
              provider === Providers.AWS
                ? 'clusters.cluster.x-k8s.io'
                : 'cluster'
            } ${clusterName} \\
            -n ${clusterNamespace} \\
            --type merge \\
            --patch '{"metadata": {"labels": {"foo": "bar"}}}'
          `}
        >
          <Text>
            The above command would add the label <code>foo</code> with the
            value <code>bar</code>.
          </Text>
        </CLIGuideStep>
      </CLIGuideStepList>
    </CLIGuide>
  );
};

export default SetClusterLabelsGuide;

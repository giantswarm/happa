import { Text } from 'grommet';
import LoginGuideStep from 'MAPI/guides/LoginGuideStep';
import UnauthorizedMessage from 'MAPI/guides/UnauthorizedMessage';
import { getCurrentInstallationContextName } from 'MAPI/guides/utils';
import { Providers } from 'model/constants';
import * as docs from 'model/constants/docs';
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
  canUpdateCluster?: boolean;
}

const SetClusterLabelsGuide: React.FC<ISetClusterLabelsGuideProps> = ({
  clusterName,
  clusterNamespace,
  provider,
  canUpdateCluster,
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
        {!canUpdateCluster && <UnauthorizedMessage />}
        <LoginGuideStep />
        <CLIGuideStep
          title='2. Add a label to this cluster'
          command={`
          kubectl --context ${context} \\
            label clusters.cluster.x-k8s.io ${clusterName} \\
            --namespace ${clusterNamespace} \\
            LABEL=VALUE
          `}
        >
          <Text>
            Replace <code>LABEL</code> with the label name and
            <code>VALUE</code> with the label value.
          </Text>
        </CLIGuideStep>
      </CLIGuideStepList>
    </CLIGuide>
  );
};

export default SetClusterLabelsGuide;

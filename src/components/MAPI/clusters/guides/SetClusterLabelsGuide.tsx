import { Text } from 'grommet';
import * as docs from 'lib/docs';
import LoginGuideStep from 'MAPI/guides/LoginGuideStep';
import { getCurrentInstallationContextName } from 'MAPI/guides/utils';
import PropTypes from 'prop-types';
import React from 'react';
import { useSelector } from 'react-redux';
import CLIGuide from 'UI/Display/MAPI/CLIGuide';
import CLIGuideAdditionalInfo from 'UI/Display/MAPI/CLIGuide/CLIGuideAdditionalInfo';
import CLIGuideStep from 'UI/Display/MAPI/CLIGuide/CLIGuideStep';
import CLIGuideStepList from 'UI/Display/MAPI/CLIGuide/CLIGuideStepList';

interface ISetClusterLabelsGuideProps
  extends Omit<React.ComponentPropsWithoutRef<typeof CLIGuide>, 'title'> {
  clusterName: string;
  clusterNamespace: string;
}

const SetClusterLabelsGuide: React.FC<ISetClusterLabelsGuideProps> = ({
  clusterName,
  clusterNamespace,
  ...props
}) => {
  const context = useSelector(getCurrentInstallationContextName);

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
            patch cluster ${clusterName} \\
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

SetClusterLabelsGuide.propTypes = {
  clusterName: PropTypes.string.isRequired,
  clusterNamespace: PropTypes.string.isRequired,
};

export default SetClusterLabelsGuide;

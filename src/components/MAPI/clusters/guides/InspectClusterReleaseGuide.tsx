import { Text } from 'grommet';
import * as docs from 'lib/docs';
import LoginGuideStep from 'MAPI/guides/LoginGuideStep';
import {
  getCurrentInstallationContextName,
  makeKubectlGSCommand,
  withContext,
  withFormatting,
  withGetClusters,
} from 'MAPI/guides/utils';
import PropTypes from 'prop-types';
import React from 'react';
import { useSelector } from 'react-redux';
import CLIGuide from 'UI/Display/MAPI/CLIGuide';
import CLIGuideAdditionalInfo from 'UI/Display/MAPI/CLIGuide/CLIGuideAdditionalInfo';
import CLIGuideStep from 'UI/Display/MAPI/CLIGuide/CLIGuideStep';
import CLIGuideStepList from 'UI/Display/MAPI/CLIGuide/CLIGuideStepList';

interface IInspectClusterReleaseGuideProps
  extends Omit<React.ComponentPropsWithoutRef<typeof CLIGuide>, 'title'> {
  clusterName: string;
  clusterNamespace: string;
  releaseVersion: string;
}

const InspectClusterReleaseGuide: React.FC<IInspectClusterReleaseGuideProps> = ({
  clusterName,
  clusterNamespace,
  releaseVersion,
  ...props
}) => {
  const context = useSelector(getCurrentInstallationContextName);

  return (
    <CLIGuide
      title={`Inspect this cluster's release via the Management API`}
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
              href: docs.clusterCRDSchemaURL,
              external: true,
            },
            {
              label: 'Release CRD schema',
              href: docs.releaseCRDSchemaURL,
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
          title='2. Find out which release version is used by this cluster'
          command={makeKubectlGSCommand(
            withContext(context),
            withGetClusters({
              name: clusterName,
              namespace: clusterNamespace,
              output: `jsonpath={.metadata.labels.release\\.giantswarm\\.io/version}`,
            }),
            withFormatting()
          )}
        >
          <Text>
            This should print out <code>{releaseVersion}</code>.
          </Text>
        </CLIGuideStep>
        <CLIGuideStep
          title='3. Get release details'
          command={`kubectl --context ${context} describe release v${releaseVersion}`}
        >
          <Text>
            <strong>Note:</strong> You will need the <code>v</code> prefix
            appended to the version number.
          </Text>
        </CLIGuideStep>
      </CLIGuideStepList>
    </CLIGuide>
  );
};

InspectClusterReleaseGuide.propTypes = {
  clusterName: PropTypes.string.isRequired,
  clusterNamespace: PropTypes.string.isRequired,
  releaseVersion: PropTypes.string.isRequired,
};

export default InspectClusterReleaseGuide;

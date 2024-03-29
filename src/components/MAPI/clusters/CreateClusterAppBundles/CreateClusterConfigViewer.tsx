import { Box, Heading } from 'grommet';
import yaml from 'js-yaml';
import * as applicationv1alpha1 from 'model/services/mapi/applicationv1alpha1';
import React, { useState } from 'react';
import { Tab, Tabs } from 'UI/Display/Tabs';

import CreateClusterConfigViewerConfigInspector from './CreateClusterConfigViewerConfigInspector';
import { IClusterAppConfig, templateClusterCreationManifest } from './utils';

interface ICreateClusterConfigViewerProps {
  clusterAppConfig: IClusterAppConfig;
}

const CreateClusterConfigViewer: React.FC<ICreateClusterConfigViewerProps> = ({
  clusterAppConfig,
  ...props
}) => {
  const [activeTab, setActiveTab] = useState<number>(0);

  return (
    <Box {...props}>
      <Heading>Get configuration or manifest</Heading>
      <Tabs activeIndex={activeTab} onActive={setActiveTab}>
        <Tab title='Config values'>
          <CreateClusterConfigViewerConfigInspector
            info={`Config values is a pure YAML representation of the configuration you
            specified using the form. Default values are not included. To create
            a cluster, you'll have to create an App resource for the ${applicationv1alpha1.getClusterAppNameForProvider(
              clusterAppConfig.provider
            )}
            app and provide these values via the user-values ConfigMap resource.`}
            data={yaml.dump(yaml.load(clusterAppConfig.configMapContents), {
              indent: 2,
              quotingType: '"',
              lineWidth: -1,
            })}
            filename={`${clusterAppConfig.clusterName}-config-values.yaml`}
          />
        </Tab>
        <Tab title='Full manifest'>
          <CreateClusterConfigViewerConfigInspector
            info={
              <>
                The following YAML manifest includes all resources needed to
                create the cluster as configured via the Management API, using
                e.g. <code>kubectl apply</code>.
              </>
            }
            data={templateClusterCreationManifest(clusterAppConfig)}
            filename={`${clusterAppConfig.clusterName}-manifest.yaml`}
          />
        </Tab>
      </Tabs>
    </Box>
  );
};

export default CreateClusterConfigViewer;

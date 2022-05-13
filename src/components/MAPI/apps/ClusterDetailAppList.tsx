import { Accordion, Box, Text } from 'grommet';
import * as applicationv1alpha1 from 'model/services/mapi/applicationv1alpha1';
import React, { useState } from 'react';

import ClusterDetailAppListItem from './ClusterDetailAppListItem';
import { IAppsPermissions } from './permissions/types';

const LOADING_COMPONENTS = new Array(3).fill(0);

interface IClusterDetailAppListProps
  extends React.ComponentPropsWithoutRef<typeof Box> {
  apps: applicationv1alpha1.IApp[];
  appsPermissions?: IAppsPermissions;
  isLoading?: boolean;
  errorMessage?: string;
}

const ClusterDetailAppList: React.FC<
  React.PropsWithChildren<IClusterDetailAppListProps>
> = ({
  apps,
  appsPermissions,
  isLoading,
  children,
  errorMessage,
  ...props
}) => {
  const [activeIndex, setActiveIndex] = useState(-1);

  const resetActiveIndex = () => setActiveIndex(-1);

  return (
    <Box {...props}>
      <Accordion
        gap='small'
        activeIndex={activeIndex}
        onActive={(indexes) => !isLoading && setActiveIndex(indexes[0])}
      >
        {errorMessage && (
          <Box
            background='background-front'
            round='xsmall'
            pad='medium'
            direction='column'
            gap='small'
          >
            <Text weight='bold'>There was a problem loading apps</Text>
            <Text>{errorMessage}</Text>
          </Box>
        )}

        {apps.length === 0 && !isLoading && !errorMessage && (
          <Box
            background='background-front'
            round='xsmall'
            pad='medium'
            direction='column'
            gap='small'
          >
            <Text weight='bold'>No apps installed on this cluster</Text>
            <Text color='text-weak'>
              Browse the Apps page to find any apps to install.
            </Text>
          </Box>
        )}

        {isLoading &&
          !errorMessage &&
          LOADING_COMPONENTS.map((_, i) => (
            <ClusterDetailAppListItem key={i} />
          ))}

        {!errorMessage &&
          apps.map((app, idx) => (
            <ClusterDetailAppListItem
              key={app.metadata.name}
              app={app}
              appsPermissions={appsPermissions}
              isActive={activeIndex === idx}
              onAppUninstalled={resetActiveIndex}
            />
          ))}
      </Accordion>
      {children}
    </Box>
  );
};

export default ClusterDetailAppList;

import { Accordion, Box, Text } from 'grommet';
import * as applicationv1alpha1 from 'model/services/mapi/applicationv1alpha1';
import React, { useState } from 'react';
import {
  TREE_VIEW_ITEM_HEIGHT,
  TreeViewItem,
  TreeViewSubtree,
} from 'UI/Display/MAPI/apps/ClusterDetailAppListTreeView';

import ClusterDetailAppListItem from './ClusterDetailAppListItem';
import { IAppsPermissions } from './permissions/types';

const LOADING_COMPONENTS = new Array(3).fill(0);

interface IClusterDetailAppListProps
  extends React.ComponentPropsWithoutRef<typeof Box> {
  apps: applicationv1alpha1.IApp[];
  appList?: applicationv1alpha1.IAppList;
  appsPermissions?: IAppsPermissions;
  isLoading?: boolean;
  isClusterCreating?: boolean;
  errorMessage?: string;
  isChildApps?: boolean;
  canBeModified?: boolean;
}

const ClusterDetailAppList: React.FC<
  React.PropsWithChildren<IClusterDetailAppListProps>
> = ({
  apps,
  appList,
  appsPermissions,
  isLoading,
  isClusterCreating = false,
  children,
  errorMessage,
  isChildApps = false,
  canBeModified = false,
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
            <Text weight='bold'>
              {isClusterCreating
                ? 'The cluster is currently being created'
                : 'No apps installed on this cluster'}
            </Text>
            <Text color='text-weak'>
              {isClusterCreating
                ? 'Apps will be displayed here once the cluster is ready.'
                : 'Browse the Apps page to find any apps to install.'}
            </Text>
          </Box>
        )}

        {isLoading &&
          !errorMessage &&
          LOADING_COMPONENTS.map((_, i) => (
            <ClusterDetailAppListItem key={i} />
          ))}

        {!errorMessage &&
          apps.map((app, idx) => {
            const isLastItem = idx === apps.length - 1;
            const childApps = appList?.items.filter(
              (item) =>
                item.metadata?.labels?.[applicationv1alpha1.labelManagedBy] ===
                app.metadata.name
            );

            return (
              <React.Fragment key={app.metadata.name}>
                <TreeViewItem
                  isRootItem={isChildApps === false}
                  isLastItem={isLastItem}
                >
                  <ClusterDetailAppListItem
                    app={app}
                    appsPermissions={appsPermissions}
                    isActive={activeIndex === idx}
                    canBeModified={canBeModified}
                    onAppUninstalled={resetActiveIndex}
                    minHeight={TREE_VIEW_ITEM_HEIGHT}
                  />
                </TreeViewItem>
                {childApps && childApps.length > 0 && (
                  <TreeViewSubtree
                    isRootItemSubtree={isChildApps === false}
                    isLastSubtree={isLastItem}
                  >
                    <ClusterDetailAppList
                      apps={childApps}
                      appList={appList}
                      appsPermissions={appsPermissions}
                      isLoading={false}
                      isChildApps={true}
                    />
                  </TreeViewSubtree>
                )}
              </React.Fragment>
            );
          })}
      </Accordion>
      {children}
    </Box>
  );
};

export default ClusterDetailAppList;

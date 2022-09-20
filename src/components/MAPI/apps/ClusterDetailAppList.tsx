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
  isClusterApp?: boolean;
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
  isClusterApp,
  canBeModified = false,
  ...props
}) => {
  const [activeApps, setActiveApps] = useState<string[]>([]);
  const activeIndexes = activeApps.map((activeApp) =>
    apps.findIndex((app) => app.metadata.name === activeApp)
  );

  const setActiveIndexes = (indexes: number[]) => {
    setActiveApps(indexes.map((idx) => apps[idx].metadata.name));
  };

  const resetActiveApp = (activeApp: string) => {
    const index = activeApps.indexOf(activeApp);
    if (index > -1) {
      setActiveApps([
        ...activeApps.slice(0, index),
        ...activeApps.slice(index + 1),
      ]);
    }
  };

  return (
    <Box {...props}>
      <Accordion
        gap='small'
        multiple={true}
        activeIndex={activeIndexes}
        onActive={(indexes) => !isLoading && setActiveIndexes(indexes)}
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
                    isActive={activeApps.indexOf(app.metadata.name) !== -1}
                    canBeModified={canBeModified}
                    isClusterApp={isClusterApp}
                    onAppUninstalled={() => resetActiveApp(app.metadata.name)}
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
                      isClusterApp={isClusterApp}
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

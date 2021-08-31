import { Accordion, Box } from 'grommet';
import * as applicationv1alpha1 from 'model/services/mapi/applicationv1alpha1';
import React, { useState } from 'react';

import ClusterDetailAppListItem from './ClusterDetailAppListItem';

interface IClusterDetailAppListProps
  extends React.ComponentPropsWithoutRef<typeof Box> {
  apps: applicationv1alpha1.IApp[];
  isLoading?: boolean;
}

const ClusterDetailAppList: React.FC<IClusterDetailAppListProps> = ({
  apps,
  isLoading,
  children,
  ...props
}) => {
  const [activeIndex, setActiveIndex] = useState(-1);

  return (
    <Box {...props}>
      <Accordion
        gap='small'
        activeIndex={activeIndex}
        onActive={(indexes) => setActiveIndex(indexes[0])}
      >
        {apps.map((app, idx) => (
          <ClusterDetailAppListItem
            key={app.metadata.name}
            app={app}
            isActive={activeIndex === idx}
          />
        ))}
      </Accordion>
      {children}
    </Box>
  );
};

export default ClusterDetailAppList;

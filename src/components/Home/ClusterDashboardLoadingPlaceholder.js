import React from 'react';
import ContentLoader from 'react-content-loader';
import theme from 'styles/theme';

// It renders loading placeholders for v5 and v4 clusters.
const ClusterDashboardLoadingPlaceholder = ({ isV5Cluster }) => (
  <ContentLoader
    viewBox='0 0 400 25'
    speed={1}
    height='27'
    backgroundColor={theme.colors.darkBlueLighter2}
    foregroundColor={theme.colors.loadingForeground}
  >
    {isV5Cluster ? (
      <>
        <rect x='0' y='4' rx='4' ry='4' width='145' height='20' />
        <rect x='155' y='4' rx='4' ry='4' width='75' height='20' />
        <rect x='240' y='4' rx='4' ry='4' width='70' height='20' />
      </>
    ) : (
      <rect x='0' y='4' rx='4' ry='4' width='80' height='20' />
    )}
  </ContentLoader>
);

export default ClusterDashboardLoadingPlaceholder;

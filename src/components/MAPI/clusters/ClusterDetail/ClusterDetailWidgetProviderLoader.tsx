import { Providers } from 'model/constants';
import React from 'react';
import LoadingPlaceholder from 'UI/Display/LoadingPlaceholder/LoadingPlaceholder';

const ClusterDetailWidgetProviderLoader: React.FC = () => {
  const provider = window.config.info.general.provider;
  const itemsCount = provider === Providers.AZURE ? 3 : 2;

  const items = Array.from(Array(itemsCount)).map(() => ({}));

  return (
    <>
      {items.map((_, idx) => (
        <React.Fragment key={idx}>
          <LoadingPlaceholder margin={{ vertical: 'xsmall' }} />
          <LoadingPlaceholder margin={{ vertical: 'xsmall' }} />
        </React.Fragment>
      ))}
    </>
  );
};

export default ClusterDetailWidgetProviderLoader;

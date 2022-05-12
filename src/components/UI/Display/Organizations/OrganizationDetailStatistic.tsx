import { Text } from 'grommet';
import * as React from 'react';
import LoadingPlaceholder from 'UI/Display/LoadingPlaceholder/LoadingPlaceholder';

import NotAvailable from '../NotAvailable';

interface IOrganizationDetailStatisticProps
  extends React.ComponentPropsWithoutRef<typeof Text> {
  isLoading?: boolean;
}

const OrganizationDetailStatistic: React.FC<
  React.PropsWithChildren<IOrganizationDetailStatisticProps>
> = ({ children, isLoading, ...props }) => {
  return (
    <Text {...props}>
      {isLoading && <LoadingPlaceholder height={20} width={80} />}
      {typeof children === 'undefined' && !isLoading && <NotAvailable />}
      {typeof children !== 'undefined' && !isLoading && children}
    </Text>
  );
};

export default OrganizationDetailStatistic;

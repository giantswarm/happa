import { Text } from 'grommet';
import PropTypes from 'prop-types';
import * as React from 'react';

import NotAvailable from '../NotAvailable';
import OrganizationDetailStatisticPlaceholder from './OrganizationDetailStatisticPlaceholder';

interface IOrganizationDetailStatisticProps
  extends React.ComponentPropsWithoutRef<typeof Text> {
  isLoading?: boolean;
}

const OrganizationDetailStatistic: React.FC<IOrganizationDetailStatisticProps> = ({
  children,
  isLoading,
  ...props
}) => {
  if (isLoading) return <OrganizationDetailStatisticPlaceholder />;

  if (!children) return <NotAvailable />;

  return <Text {...props}>{children}</Text>;
};

OrganizationDetailStatistic.propTypes = {
  isLoading: PropTypes.bool,
  children: PropTypes.node,
};

export default OrganizationDetailStatistic;

import { Text } from 'grommet';
import PropTypes from 'prop-types';
import * as React from 'react';

import LoadingPlaceholder from '../MAPI/clusters/ClusterDetail/LoadingPlaceholder';
import NotAvailable from '../NotAvailable';

interface IOrganizationDetailStatisticProps
  extends React.ComponentPropsWithoutRef<typeof Text> {
  isLoading?: boolean;
}

const OrganizationDetailStatistic: React.FC<IOrganizationDetailStatisticProps> = ({
  children,
  isLoading,
  ...props
}) => {
  return (
    <Text {...props}>
      {isLoading && <LoadingPlaceholder height={20} width={80} />}
      {typeof children === 'undefined' && !isLoading && <NotAvailable />}
      {typeof children !== 'undefined' && !isLoading && children}
    </Text>
  );
};

OrganizationDetailStatistic.propTypes = {
  isLoading: PropTypes.bool,
  children: PropTypes.node,
};

export default OrganizationDetailStatistic;

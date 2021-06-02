import PropTypes from 'prop-types';
import * as React from 'react';
import styled from 'styled-components';
import NotAvailable from 'UI/Display/NotAvailable';
import RefreshableLabel from 'UI/Display/RefreshableLabel';

import ClusterListItemLoadingPlaceholder from './ClusterListItemLoadingPlaceholder';

const StyledRefreshableLabel = styled(RefreshableLabel)`
  padding: 0;
  margin: 0;
`;

interface IClusterListItemOptionalValueProps {
  children: (value: string | number) => React.ReactElement;
  value?: string | number;
  replaceEmptyValue?: boolean;
}

const ClusterListItemOptionalValue: React.FC<IClusterListItemOptionalValueProps> = ({
  value,
  children,
  replaceEmptyValue,
}) => {
  if (typeof value === 'undefined') {
    return (
      <ClusterListItemLoadingPlaceholder margin={{ vertical: 'xsmall' }} />
    );
  }

  if (replaceEmptyValue && (value === '' || value === -1)) {
    return <NotAvailable />;
  }

  return (
    // @ts-expect-error
    <StyledRefreshableLabel value={value}>
      {children(value)}
    </StyledRefreshableLabel>
  );
};

ClusterListItemOptionalValue.propTypes = {
  children: PropTypes.func.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  replaceEmptyValue: PropTypes.bool,
};

ClusterListItemOptionalValue.defaultProps = {
  replaceEmptyValue: true,
};

export default ClusterListItemOptionalValue;

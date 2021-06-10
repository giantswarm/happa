import PropTypes from 'prop-types';
import * as React from 'react';
import styled from 'styled-components';
import NotAvailable from 'UI/Display/NotAvailable';
import RefreshableLabel from 'UI/Display/RefreshableLabel';

import ClusterDetailWidgetLoadingPlaceholder from './ClusterDetailWidgetLoadingPlaceholder';

const StyledRefreshableLabel = styled(RefreshableLabel)`
  padding: 0;
  margin: 0;
`;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Value = string | number | Record<string, any>;

interface IClusterDetailWidgetOptionalValueProps {
  children: (value: Value) => React.ReactElement;
  value?: Value;
  replaceEmptyValue?: boolean;
  loaderHeight?: number;
  loaderWidth?: number;
}

const ClusterDetailWidgetOptionalValue: React.FC<IClusterDetailWidgetOptionalValueProps> = ({
  value,
  children,
  replaceEmptyValue,
  loaderHeight,
  loaderWidth,
}) => {
  if (typeof value === 'undefined') {
    return (
      <ClusterDetailWidgetLoadingPlaceholder
        margin={{ vertical: 'xsmall' }}
        height={loaderHeight}
        width={loaderWidth}
      />
    );
  }

  if (replaceEmptyValue && (value === '' || value === -1)) {
    return <NotAvailable />;
  }

  const refreshableKey = JSON.stringify(value);

  return (
    // @ts-expect-error
    <StyledRefreshableLabel value={refreshableKey}>
      {children(value)}
    </StyledRefreshableLabel>
  );
};

ClusterDetailWidgetOptionalValue.propTypes = {
  children: PropTypes.func.isRequired,
  value: PropTypes.any,
  replaceEmptyValue: PropTypes.bool,
  loaderHeight: PropTypes.number,
  loaderWidth: PropTypes.number,
};

ClusterDetailWidgetOptionalValue.defaultProps = {
  replaceEmptyValue: true,
};

export default ClusterDetailWidgetOptionalValue;

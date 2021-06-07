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

interface IClusterDetailWidgetOptionalValueProps {
  children: (value: string | number) => React.ReactElement;
  value?: string | number;
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

  return (
    // @ts-expect-error
    <StyledRefreshableLabel value={value}>
      {children(value)}
    </StyledRefreshableLabel>
  );
};

ClusterDetailWidgetOptionalValue.propTypes = {
  children: PropTypes.func.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  replaceEmptyValue: PropTypes.bool,
  loaderHeight: PropTypes.number,
  loaderWidth: PropTypes.number,
};

ClusterDetailWidgetOptionalValue.defaultProps = {
  replaceEmptyValue: true,
};

export default ClusterDetailWidgetOptionalValue;

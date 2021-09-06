import * as React from 'react';
import styled from 'styled-components';
import LoadingPlaceholder from 'UI/Display/LoadingPlaceholder/LoadingPlaceholder';
import NotAvailable from 'UI/Display/NotAvailable';
import RefreshableLabel from 'UI/Display/RefreshableLabel';

const StyledRefreshableLabel = styled(RefreshableLabel)`
  padding: 0;
  margin: 0;
`;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Value = string | number | Record<string, any>;

interface IOptionalValueProps {
  children: (value: Value) => React.ReactElement;
  value?: Value;
  replaceEmptyValue?: boolean;
  loaderHeight?: number;
  loaderWidth?: number;
  flashOnValueChange?: boolean;
}

const OptionalValue: React.FC<IOptionalValueProps> = ({
  value,
  children,
  replaceEmptyValue,
  loaderHeight,
  loaderWidth,
  flashOnValueChange,
}) => {
  if (typeof value === 'undefined') {
    return (
      <LoadingPlaceholder
        margin={{ vertical: 'xsmall' }}
        height={loaderHeight}
        width={loaderWidth}
      />
    );
  }

  if (replaceEmptyValue && (value === '' || value === -1)) {
    return <NotAvailable />;
  }

  if (!flashOnValueChange) {
    return children(value);
  }

  const refreshableKey = JSON.stringify(value);

  return (
    <StyledRefreshableLabel value={refreshableKey}>
      {children(value)}
    </StyledRefreshableLabel>
  );
};

OptionalValue.defaultProps = {
  replaceEmptyValue: true,
  flashOnValueChange: true,
};

export default OptionalValue;

import * as React from 'react';
import styled from 'styled-components';
import LoadingPlaceholder from 'UI/Display/LoadingPlaceholder/LoadingPlaceholder';
import NotAvailable from 'UI/Display/NotAvailable';
import RefreshableLabel from 'UI/Display/RefreshableLabel';

const StyledRefreshableLabel = styled(RefreshableLabel)`
  padding: 0;
  margin: 0;
`;

interface IOptionalValueProps<T> {
  children: (value: T) => React.ReactElement;
  value?: T;
  replaceEmptyValue?: boolean;
  loaderHeight?: number;
  loaderWidth?: number;
  flashOnValueChange?: boolean;
}

const OptionalValue = <T,>({
  value,
  children,
  replaceEmptyValue,
  loaderHeight,
  loaderWidth,
  flashOnValueChange,
}: IOptionalValueProps<T>) => {
  if (typeof value === 'undefined') {
    return (
      <LoadingPlaceholder
        margin={{ vertical: 'xsmall' }}
        height={loaderHeight}
        width={loaderWidth}
      />
    );
  }

  if (
    replaceEmptyValue &&
    ((typeof value === 'string' && value === '') ||
      (typeof value === 'number' && value === -1))
  ) {
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

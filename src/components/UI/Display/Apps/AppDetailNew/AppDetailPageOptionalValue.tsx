import PropTypes from 'prop-types';
import * as React from 'react';
import NotAvailable from 'UI/Display/NotAvailable';

import AppDetailsLoadingPlaceholder from './AppDetailsLoadingPlaceholder';

interface IAppDetailPageOptionalValueProps {
  children: (value: string) => React.ReactElement;
  value?: string;
}

const AppDetailPageOptionalValue: React.FC<IAppDetailPageOptionalValueProps> = ({
  value,
  children,
}) => {
  if (typeof value === 'undefined') {
    return <AppDetailsLoadingPlaceholder />;
  }

  if (value === '') {
    return <NotAvailable />;
  }

  return children(value);
};

AppDetailPageOptionalValue.propTypes = {
  value: PropTypes.string,
};

export default AppDetailPageOptionalValue;

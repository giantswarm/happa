// NotAvailable
//
// A placeholder label to be used where we have no data available to display.
//

import React, { FC } from 'react';
import styled from 'styled-components';

const NotAvailableOuter = styled.span`
  opacity: 0.5;
`;

interface INotAvailableProps extends React.HTMLAttributes<HTMLDivElement> {}

const NotAvailable: FC<INotAvailableProps> = (props) => {
  return (
    <NotAvailableOuter {...props}>
      <abbr aria-label='no information available'>n/a</abbr>
    </NotAvailableOuter>
  );
};

NotAvailable.propTypes = {};

export default NotAvailable;

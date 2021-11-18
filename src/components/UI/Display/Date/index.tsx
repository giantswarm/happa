import { Text } from 'grommet';
import { formatDate, getRelativeDateFromNow } from 'lib/helpers';
import React, { useMemo } from 'react';
import { Tooltip, TooltipContainer } from 'UI/Display/Tooltip';

import NotAvailable from '../NotAvailable';

interface IDateProps extends React.ComponentPropsWithoutRef<typeof Text> {
  value: string | number | Date | null | undefined;
  relative?: boolean;
  tooltip?: boolean;
}

const Date: React.FC<IDateProps> = ({ value, relative, ...props }) => {
  const formattedDate = useMemo(() => {
    if (!value) return '';

    return formatDate(value);
  }, [value]);

  const visibleDate = useMemo(() => {
    if (!value) return '';

    if (relative) {
      return getRelativeDateFromNow(value);
    }

    return formattedDate;
  }, [formattedDate, relative, value]);

  if (!value) {
    return <NotAvailable />;
  }

  if (relative) {
    return (
      <TooltipContainer content={<Tooltip>{formattedDate}</Tooltip>}>
        <Text {...props} key='date'>
          {visibleDate}
        </Text>
      </TooltipContainer>
    );
  }

  return (
    <Text {...props} key='date'>
      {visibleDate}
    </Text>
  );
};

export default Date;

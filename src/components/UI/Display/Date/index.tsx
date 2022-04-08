import differenceInMinutes from 'date-fns/differenceInMinutes';
import { Text } from 'grommet';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Tooltip, TooltipContainer } from 'UI/Display/Tooltip';
import { formatDate, getRelativeDate, parseDate } from 'utils/helpers';

import NotAvailable from '../NotAvailable';

interface IDateProps extends React.ComponentPropsWithoutRef<typeof Text> {
  value: string | number | Date | null | undefined;
  relative?: boolean;
  tooltip?: boolean;
}

// eslint-disable-next-line no-magic-numbers
const REFRESH_TIMEOUT = 60 * 1000; // 1 minute
const REFRESH_PERIOD = 45; // 45 minutes

const DateComponent: React.FC<IDateProps> = ({ value, relative, ...props }) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  const formattedDate = useMemo(() => {
    if (!value) return '';

    return formatDate(value);
  }, [value]);

  const timeoutId = useRef<ReturnType<typeof setTimeout>>();
  useEffect(() => {
    if (!value || !relative) return undefined;

    const givenDate = parseDate(value);
    const distance = differenceInMinutes(currentTime, givenDate);
    if (Math.abs(distance) > REFRESH_PERIOD) {
      if (timeoutId.current) {
        clearTimeout(timeoutId.current);
      }

      return undefined;
    }

    timeoutId.current = setTimeout(() => {
      setCurrentTime(new Date());
    }, REFRESH_TIMEOUT);

    return () => {
      if (timeoutId.current) {
        clearTimeout(timeoutId.current);
      }
    };
  }, [value, relative, currentTime]);

  const visibleDate = useMemo(() => {
    if (!value) return '';

    if (relative) {
      return getRelativeDate(value, currentTime);
    }

    return formattedDate;
  }, [formattedDate, relative, value, currentTime]);

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

export default DateComponent;

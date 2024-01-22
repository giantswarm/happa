import differenceInMinutes from 'date-fns/differenceInMinutes';
import { Text } from 'grommet';
import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { FlashMessageType } from 'styles';
import FlashMessageComponent from 'UI/Display/FlashMessage';
import { parseDate } from 'utils/helpers';

const StyledFlashMessage = styled(FlashMessageComponent)`
  display: flex;
  margin-bottom: ${({ theme }) => theme.spacingPx * 5}px;
`;

// eslint-disable-next-line no-magic-numbers
const REFRESH_TIMEOUT = 30 * 1000; // 30 seconds
const REFRESH_PERIOD = 5; // 5 minutes

function shouldDisplayNote(organization: IOrganization, currentTime: Date) {
  const creationTimestamp = organization.creationTimestamp;
  const createdAt = creationTimestamp
    ? parseDate(creationTimestamp)
    : undefined;
  const distance = createdAt
    ? Math.abs(differenceInMinutes(currentTime, createdAt))
    : undefined;

  return typeof distance !== 'undefined' && distance < REFRESH_PERIOD;
}

interface OrganizationCreatedNoteProps {
  organization: IOrganization;
}

const OrganizationCreatedNote = ({
  organization,
}: OrganizationCreatedNoteProps) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  const displayNote = shouldDisplayNote(organization, currentTime);

  const timeoutId = useRef<ReturnType<typeof setTimeout>>();
  useEffect(() => {
    if (!displayNote) {
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
  }, [displayNote, currentTime]);

  useEffect(() => {
    setCurrentTime(new Date());
  }, [organization]);

  if (!displayNote) {
    return null;
  }

  return (
    <StyledFlashMessage type={FlashMessageType.Info}>
      <Text>
        <i
          className='fa fa-change-in-progress'
          role='presentation'
          aria-hidden='true'
        />{' '}
        It may take up to five minutes until all permissions are set up for this
        organization.
      </Text>
    </StyledFlashMessage>
  );
};

export default OrganizationCreatedNote;

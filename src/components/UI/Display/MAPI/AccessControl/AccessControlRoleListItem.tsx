import { Box, Card, CardBody, CardHeader, Heading, Text } from 'grommet';
import * as React from 'react';
import styled from 'styled-components';
import { Tooltip, TooltipContainer } from 'UI/Display/Tooltip';

import { IAccessControlRoleItem } from './types';

function formatCounter(fromValue: number): string {
  switch (true) {
    // eslint-disable-next-line no-magic-numbers
    case fromValue > 99:
      return '99+';
    default:
      return fromValue.toString();
  }
}

const StyledCard = styled(Card)`
  min-height: auto;
  box-shadow: ${(props) =>
    props['aria-selected']
      ? `0 0 0 1px ${props.theme.global.colors.text.dark}`
      : 'none'};
  outline: ${(props) => props['aria-selected'] && 'none'};
  transition: opacity 0.1s ease-out, box-shadow 0.1s ease-in-out;

  :hover,
  :focus {
    box-shadow: ${(props) =>
      `0 0 0 1px ${props.theme.global.colors.text.dark}`};
  }

  :active {
    opacity: 0.7;
  }
`;

const StyledHeading = styled(Heading)`
  max-width: 100%;
`;

interface IAccessControlRoleListItemProps
  extends IAccessControlRoleItem,
    React.ComponentPropsWithoutRef<typeof Card> {
  active?: boolean;
}

const AccessControlRoleListItem = React.forwardRef<
  HTMLDivElement,
  IAccessControlRoleListItemProps
>(
  (
    {
      name,
      namespace,
      active,
      permissions,
      groups,
      users,
      serviceAccounts,
      ...props
    },
    ref
  ) => {
    const groupCount = Object.values(groups).length;
    const groupCountFormatted = formatCounter(groupCount);
    const userCount = Object.values(users).length;
    const userCountFormatted = formatCounter(userCount);
    const serviceAccountCount = Object.values(serviceAccounts).length;
    const serviceAccountCountFormatted = formatCounter(serviceAccountCount);

    return (
      <StyledCard
        pad={{ vertical: 'small', horizontal: 'medium' }}
        round='xsmall'
        elevation='none'
        overflow='visible'
        background='background-front'
        aria-selected={active}
        role='button'
        tabIndex={active ? -1 : 0}
        aria-label={name}
        {...props}
        ref={ref}
      >
        <CardHeader>
          <StyledHeading level={5} margin='none'>
            <Box direction='row' align='center'>
              <Text truncate={true}>{name}</Text>

              {namespace.length < 1 && (
                <Text margin={{ left: 'xxsmall' }}>
                  <i
                    className='fa fa-globe'
                    role='presentation'
                    aria-label='Cluster role'
                  />
                </Text>
              )}
            </Box>
          </StyledHeading>
        </CardHeader>
        <CardBody margin={{ top: 'xsmall' }}>
          <Box justify='between' direction='row'>
            <Box width='100px'>
              <Text
                color={groupCount > 0 ? 'text-weak' : 'text-xweak'}
                size='small'
                aria-label={`Groups: ${groupCountFormatted}`}
              >
                <TooltipContainer content={<Tooltip>Groups</Tooltip>}>
                  <i className='fa fa-group' role='presentation' />
                </TooltipContainer>{' '}
                {groupCountFormatted}
              </Text>
            </Box>
            <Box width='100px'>
              <Text
                color={userCount > 0 ? 'text-weak' : 'text-xweak'}
                size='small'
                aria-label={`Users: ${userCountFormatted}`}
              >
                <TooltipContainer content={<Tooltip>Users</Tooltip>}>
                  <i className='fa fa-user' role='presentation' />
                </TooltipContainer>{' '}
                {userCountFormatted}
              </Text>
            </Box>
            <Box width='100px'>
              <Text
                color={serviceAccountCount > 0 ? 'text-weak' : 'text-xweak'}
                size='small'
                aria-label={`Service accounts: ${serviceAccountCountFormatted}`}
              >
                <TooltipContainer content={<Tooltip>Service accounts</Tooltip>}>
                  <i className='fa fa-service-account' role='presentation' />
                </TooltipContainer>{' '}
                {serviceAccountCountFormatted}
              </Text>
            </Box>
          </Box>
        </CardBody>
      </StyledCard>
    );
  }
);

export default AccessControlRoleListItem;

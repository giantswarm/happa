import { Box, Card, CardBody, CardHeader, Heading, Text } from 'grommet';
import PropTypes from 'prop-types';
import * as React from 'react';
import styled from 'styled-components';

import {
  IAccessControlRoleItem,
  IAccessControlRoleItemPermission,
} from './types';

function formatResourceCounter(
  permissions: IAccessControlRoleItemPermission[]
): string {
  let totalCount = 0;
  for (const perm of permissions) {
    for (const group of perm.apiGroups) {
      if (group === '*') return 'All';
    }
    for (const resource of perm.resources) {
      if (resource === '*') return 'All';
    }

    totalCount += perm.resourceNames.length + perm.resources.length;
  }

  return formatCounter(totalCount);
}

function formatCounter(fromValue: number): string {
  switch (true) {
    case fromValue === 0:
      return 'None';
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

interface IAccessControlRoleListItemProps
  extends IAccessControlRoleItem,
    React.ComponentPropsWithoutRef<typeof Card> {
  active?: boolean;
}

const AccessControlRoleListItem = React.forwardRef<
  HTMLDivElement,
  IAccessControlRoleListItemProps
>(({ name, inCluster, active, permissions, groups, users, ...props }, ref) => {
  const resourceCount = formatResourceCounter(permissions);
  const groupCount = formatCounter(Object.values(groups).length);
  const userCount = formatCounter(Object.values(users).length);

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
      {...props}
      ref={ref}
    >
      <CardHeader>
        <Heading level={5} margin='none'>
          <Box direction='row' align='center'>
            <Text truncate={true}>{name}</Text>

            {inCluster && (
              <Text margin={{ left: 'xxsmall' }}>
                <i className='fa fa-globe' aria-label='Cluster role' />
              </Text>
            )}
          </Box>
        </Heading>
      </CardHeader>
      <CardBody margin={{ top: 'xsmall' }}>
        <Box justify='between' direction='row'>
          <Box width='120px'>
            <Text color='text-weak'>Resources: {resourceCount}</Text>
          </Box>
          <Box width='100px'>
            <Text color='text-weak'>Groups: {groupCount}</Text>
          </Box>
          <Box width='100px'>
            <Text color='text-weak'>Users: {userCount}</Text>
          </Box>
        </Box>
      </CardBody>
    </StyledCard>
  );
});

AccessControlRoleListItem.propTypes = {
  name: PropTypes.string.isRequired,
  inCluster: PropTypes.bool.isRequired,
  active: PropTypes.bool.isRequired,
  // @ts-expect-error
  permissions: PropTypes.arrayOf(PropTypes.object.isRequired),
  // @ts-expect-error
  groups: PropTypes.object.isRequired,
  // @ts-expect-error
  users: PropTypes.object.isRequired,
};

export default AccessControlRoleListItem;

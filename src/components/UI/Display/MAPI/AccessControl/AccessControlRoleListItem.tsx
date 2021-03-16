import { Box, Card, CardBody, CardHeader, Heading, Text } from 'grommet';
import PropTypes from 'prop-types';
import * as React from 'react';
import styled from 'styled-components';

import { IAccessRoleItem } from './types';

function formatCounter(fromValue: number): string {
  switch (true) {
    case fromValue === -1:
      return 'All';
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
  extends IAccessRoleItem,
    React.ComponentPropsWithoutRef<typeof Card> {
  active?: boolean;
}

const AccessControlRoleListItem = React.forwardRef<
  HTMLDivElement,
  IAccessControlRoleListItemProps
>(
  (
    { name, inCluster, active, resourceCount, groupCount, userCount, ...props },
    ref
  ) => {
    const resources = formatCounter(resourceCount!);
    const groups = formatCounter(groupCount!);
    const users = formatCounter(userCount!);

    return (
      <StyledCard
        pad={{ vertical: 'small', horizontal: 'medium' }}
        round='xsmall'
        elevation='none'
        background='background-front'
        aria-selected={active}
        role='button'
        tabIndex={active ? -1 : 0}
        {...props}
        ref={ref}
      >
        <CardHeader>
          <Heading level={5} margin='none'>
            <Text>{name}</Text>

            {inCluster && (
              <Text margin={{ left: 'xxsmall' }}>
                <i className='fa fa-globe' aria-label='Cluster role' />
              </Text>
            )}
          </Heading>
        </CardHeader>
        <CardBody margin={{ top: 'xsmall' }}>
          <Box justify='between' direction='row'>
            <Box width='120px'>
              <Text color='text-weak'>Resources: {resources}</Text>
            </Box>
            <Box width='120px'>
              <Text color='text-weak'>Groups: {groups}</Text>
            </Box>
            <Box width='120px'>
              <Text color='text-weak'>Users: {users}</Text>
            </Box>
          </Box>
        </CardBody>
      </StyledCard>
    );
  }
);

AccessControlRoleListItem.propTypes = {
  name: PropTypes.string.isRequired,
  inCluster: PropTypes.bool,
  active: PropTypes.bool,
  resourceCount: PropTypes.number,
  groupCount: PropTypes.number,
  userCount: PropTypes.number,
};

AccessControlRoleListItem.defaultProps = {
  inCluster: false,
  active: false,
  resourceCount: 0,
  groupCount: 0,
  userCount: 0,
};

export default AccessControlRoleListItem;

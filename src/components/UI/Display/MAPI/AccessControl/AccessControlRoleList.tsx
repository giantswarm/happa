import { Box, InfiniteScroll, Sidebar } from 'grommet';
import useDebounce from 'lib/hooks/useDebounce';
import { filterRoles } from 'MAPI/AccessControl/utils';
import PropTypes from 'prop-types';
import React, { useCallback, useMemo, useState } from 'react';
import styled from 'styled-components';
import AccessControlRoleListItem from 'UI/Display/MAPI/AccessControl/AccessControlRoleListItem';
import TextInput from 'UI/Inputs/TextInput';

import AccessControlRoleLoadingPlaceholder from './AccessControlRoleLoadingPlaceholder';
import AccessControlRolePlaceholder from './AccessControlRolePlaceholder';
import AccessControlRoleSearchPlaceholder from './AccessControlRoleSearchPlaceholder';
import { IAccessControlRoleItem } from './types';

const SEARCH_DEBOUNCE_RATE_MS = 250;
/**
 * A bunch of placeholder components used for the loading
 * animation. Replace `6` with the number of components you
 * want to show.
 *  */
const LOADING_COMPONENTS = new Array(6).fill(0).map((_, idx) => idx);

const Content = styled(Box)`
  position: sticky;
  top: 110px;
`;

interface IAccessControlRoleListProps
  extends React.ComponentPropsWithoutRef<typeof Sidebar> {
  activeRoleName: string;
  setActiveRoleName: (newName: string) => void;
  roles?: IAccessControlRoleItem[];
}

const AccessControlRoleList: React.FC<IAccessControlRoleListProps> = ({
  roles,
  activeRoleName,
  setActiveRoleName,
  ...props
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(
    searchQuery,
    SEARCH_DEBOUNCE_RATE_MS
  );

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };
  const filteredRoles = useMemo(() => {
    if (!roles) return [];

    return filterRoles(roles, debouncedSearchQuery);
  }, [debouncedSearchQuery, roles]);

  const handleItemClick = useCallback(
    (name: string) => (e: React.MouseEvent<HTMLElement>) => {
      e.preventDefault();

      setActiveRoleName(name);
    },
    [setActiveRoleName]
  );

  return (
    <Sidebar responsive={false} {...props}>
      <Content>
        <Box margin={{ bottom: 'small' }}>
          <TextInput
            icon={<i className='fa fa-search' />}
            placeholder='Find role'
            value={searchQuery}
            onChange={handleSearch}
            readOnly={!roles}
          />
        </Box>
        <Box
          height={{ max: '60vh' }}
          overflow={{ vertical: 'auto' }}
          pad='small'
        >
          {!roles &&
            LOADING_COMPONENTS.map((idx) => (
              <AccessControlRoleLoadingPlaceholder
                key={idx}
                margin={{ bottom: 'small' }}
              />
            ))}

          {roles && roles.length < 1 && <AccessControlRolePlaceholder />}

          {roles && roles.length > 0 && filteredRoles.length < 1 && (
            <AccessControlRoleSearchPlaceholder />
          )}

          <InfiniteScroll replace={true} items={filteredRoles} step={10}>
            {(role: IAccessControlRoleItem) => (
              <AccessControlRoleListItem
                key={role.name}
                margin={{ bottom: 'small' }}
                active={activeRoleName === role.name}
                onClick={handleItemClick(role.name)}
                {...role}
              />
            )}
          </InfiniteScroll>
        </Box>
      </Content>
    </Sidebar>
  );
};

AccessControlRoleList.propTypes = {
  activeRoleName: PropTypes.string.isRequired,
  setActiveRoleName: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
  // @ts-expect-error
  roles: PropTypes.arrayOf(PropTypes.object.isRequired),
};

export default AccessControlRoleList;

import { Box, Sidebar } from 'grommet';
import useDebounce from 'lib/hooks/useDebounce';
import PropTypes from 'prop-types';
import React, { useCallback, useMemo, useState } from 'react';
import AccessControlRoleListItem from 'UI/Display/MAPI/AccessControl/AccessControlRoleListItem';
import TextInput from 'UI/Inputs/TextInput';

import AccessControlRoleLoadingPlaceholder from './AccessControlRoleLoadingPlaceholder';
import AccessControlRolePlaceholder from './AccessControlRolePlaceholder';
import AccessControlRoleSearchPlaceholder from './AccessControlRoleSearchPlaceholder';
import { IAccessControlRoleItem } from './types';
import { filterRoles } from './utils';

const SEARCH_DEBOUNCE_RATE_MS = 250;
const LOADING_COMPONENTS = [1, 2, 3];

interface IAccessControlRoleListProps
  extends React.ComponentPropsWithoutRef<typeof Sidebar> {
  roles: IAccessControlRoleItem[];
  activeRoleName: string;
  setActiveRoleName: (newName: string) => void;
  isLoading?: boolean;
}

const AccessControlRoleList: React.FC<IAccessControlRoleListProps> = ({
  roles,
  activeRoleName,
  setActiveRoleName,
  isLoading,
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
      <Box margin={{ bottom: 'small' }}>
        <TextInput
          icon={<i className='fa fa-search' />}
          placeholder='Find role'
          value={searchQuery}
          onChange={handleSearch}
          readOnly={isLoading}
        />
      </Box>
      <Box direction='column' gap='small'>
        {isLoading &&
          LOADING_COMPONENTS.map((idx) => (
            <AccessControlRoleLoadingPlaceholder key={idx} />
          ))}

        {!isLoading && roles.length < 1 && <AccessControlRolePlaceholder />}

        {roles.length > 0 && filteredRoles.length < 1 && (
          <AccessControlRoleSearchPlaceholder />
        )}

        {!isLoading &&
          filteredRoles.map(({ name, ...role }) => (
            <AccessControlRoleListItem
              key={name}
              active={activeRoleName === name}
              onClick={handleItemClick(name)}
              name={name}
              {...role}
            />
          ))}
      </Box>
    </Sidebar>
  );
};

AccessControlRoleList.propTypes = {
  // @ts-expect-error
  roles: PropTypes.arrayOf(PropTypes.object.isRequired).isRequired,
  activeRoleName: PropTypes.string.isRequired,
  setActiveRoleName: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
};

AccessControlRoleList.defaultProps = {
  isLoading: false,
};

export default AccessControlRoleList;

import { Box, Sidebar } from 'grommet';
import PropTypes from 'prop-types';
import React, { useCallback, useState } from 'react';
import AccessControlRoleListItem from 'UI/Display/MAPI/AccessControl/AccessControlRoleListItem';
import TextInput from 'UI/Inputs/TextInput';

import { IAccessRoleItem } from './types';

interface IAccessControlRoleListProps
  extends React.ComponentPropsWithoutRef<typeof Sidebar> {
  roles: IAccessRoleItem[];
  activeRoleName: string;
  setActiveRoleName: (newName: string) => void;
}

const AccessControlRoleList: React.FC<IAccessControlRoleListProps> = ({
  roles,
  activeRoleName,
  setActiveRoleName,
  ...props
}) => {
  const [searchValue, setSearchValue] = useState('');

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
  };
  const filteredRoles = roles.filter((role) => {
    const query = searchValue.toLowerCase();
    const value = role.name.toLowerCase();

    return value.includes(query);
  });

  const handleItemClick = useCallback(
    (name: string) => (e: React.MouseEvent<HTMLElement>) => {
      e.preventDefault();

      setActiveRoleName(name);
    },
    [setActiveRoleName]
  );

  return (
    <Sidebar
      responsive={false}
      pad={{ left: 'none', right: 'medium' }}
      border={{ side: 'right' }}
      height={{ min: '400px' }}
      {...props}
    >
      <Box margin={{ bottom: 'small' }}>
        <TextInput
          icon={<i className='fa fa-search' />}
          placeholder='Find role'
          value={searchValue}
          onChange={handleSearch}
        />
      </Box>
      <Box direction='column' gap='small'>
        {filteredRoles.map(({ name, ...role }) => (
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
};

export default AccessControlRoleList;

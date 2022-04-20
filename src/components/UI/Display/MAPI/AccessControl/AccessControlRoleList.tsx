import { Box, InfiniteScroll, Keyboard, Sidebar } from 'grommet';
import { filterRoles } from 'MAPI/organizations/AccessControl/utils';
import React, { useCallback, useMemo, useState } from 'react';
import styled from 'styled-components';
import { VerticalScroll } from 'styles';
import TextInput from 'UI/Inputs/TextInput';
import useDebounce from 'utils/hooks/useDebounce';

import AccessControlRoleListItem from './AccessControlRoleListItem';
import AccessControlRoleListItemLoadingPlaceholder from './AccessControlRoleListItemLoadingPlaceholder';
import AccessControlRolePlaceholder from './AccessControlRolePlaceholder';
import AccessControlRoleSearchPlaceholder from './AccessControlRoleSearchPlaceholder';
import { IAccessControlRoleItem } from './types';

const SEARCH_DEBOUNCE_RATE_MS = 250;
/**
 * A bunch of placeholder components used for the loading
 * animation. Replace `6` with the number of components you
 * want to show.
 */
const LOADING_COMPONENTS = new Array(6).fill(0).map((_, idx) => idx);

const Content = styled(Box)`
  position: sticky;
  top: 110px;
`;

const RoleListWrapper = styled(Box)`
  ${VerticalScroll}
`;

interface IAccessControlRoleListProps
  extends React.ComponentPropsWithoutRef<typeof Sidebar> {
  activeRoleName: string;
  setActiveRoleName: (newName: string) => void;
  roles?: IAccessControlRoleItem[];
  isLoading?: boolean;
  errorMessage?: string;
}

const AccessControlRoleList: React.FC<
  React.PropsWithChildren<IAccessControlRoleListProps>
> = ({
  roles,
  isLoading,
  activeRoleName,
  setActiveRoleName,
  errorMessage,
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

  let loadingErrorMessage = errorMessage;
  if (loadingErrorMessage) {
    loadingErrorMessage = `Error loading roles: ${loadingErrorMessage}`;
  }

  return (
    <Sidebar responsive={false} as='aside' aria-label='Role list' {...props}>
      <Content>
        <Box
          margin={{ bottom: 'small' }}
          pad={{ left: 'small', right: 'medium' }}
        >
          <TextInput
            icon={
              <i
                className='fa fa-search'
                role='presentation'
                aria-hidden={true}
                title='Find role'
              />
            }
            placeholder='Find role'
            value={searchQuery}
            onChange={handleSearch}
            readOnly={!roles}
            error={loadingErrorMessage}
          />
        </Box>
        <Keyboard
          onSpace={(e) => {
            e.preventDefault();

            (e.target as HTMLElement).click();
          }}
        >
          <RoleListWrapper
            height={{ max: '60vh' }}
            overflow={{ vertical: 'auto' }}
            pad={{ horizontal: 'small', top: '1px' }}
          >
            {isLoading &&
              LOADING_COMPONENTS.map((idx) => (
                <AccessControlRoleListItemLoadingPlaceholder
                  key={idx}
                  margin={{ bottom: 'small' }}
                />
              ))}

            {!isLoading && roles && roles.length < 1 && (
              <AccessControlRolePlaceholder />
            )}

            {!isLoading &&
              roles &&
              roles.length > 0 &&
              filteredRoles.length < 1 && (
                <AccessControlRoleSearchPlaceholder />
              )}

            <InfiniteScroll replace={true} items={filteredRoles} step={50}>
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
          </RoleListWrapper>
        </Keyboard>
      </Content>
    </Sidebar>
  );
};

export default AccessControlRoleList;

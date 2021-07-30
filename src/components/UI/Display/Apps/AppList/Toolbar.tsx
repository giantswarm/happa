import PropTypes from 'prop-types';
import React from 'react';
import styled from 'styled-components';
import LoadingIndicator from 'UI/Display/Loading/LoadingIndicator';
import TextInput from 'UI/Inputs/TextInput';

import SortingDropdown from './SortingDropdown';

const Wrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
`;
const Search = styled.div`
  display: flex;
  align-items: center;
  position: relative;
`;

const ClearSearch = styled.a`
  position: absolute;
  left: 255px;
`;

const SearchInput = styled(TextInput)`
  width: 280px;
`;

const StyledSortingDropdown = styled(SortingDropdown)`
  margin-left: 8px;
`;

const Sort = styled.div`
  display: flex;
  align-items: center;
`;

const StyledLoadingIndicator = styled(LoadingIndicator)`
  display: inline-block;

  img {
    display: inline-block;
    vertical-align: middle;
    width: 20px;
  }
`;

function matchCountMessage(count: number) {
  if (count === 1) {
    return `Showing 1 app matching your query`;
  }

  if (count > 1) {
    return `Showing ${count} apps matching your query`;
  }

  // Anything less than 1, or non numbers
  return 'No apps match your query';
}

interface IToolbarProps {
  matchCount: number;
  onChangeSearchQuery: (value: string) => void;
  searchQuery: string;
  onChangeSortOrder: (value: string) => void;
  sortOrder: string;
  isLoading?: boolean;
}

const Toolbar: React.FC<IToolbarProps> = (props) => {
  function onChangeSearchQueryEvent(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    props.onChangeSearchQuery(event.target.value);
  }

  return (
    <Wrapper>
      <Search>
        <SearchInput
          value={props.searchQuery}
          onChange={onChangeSearchQueryEvent}
          data-testid='app-search-input'
          margin={{ bottom: 'none', right: 'small' }}
          icon={<i className='fa fa-search' />}
          readOnly={props.isLoading}
          aria-label='Search for a specific app'
        />

        {props.isLoading && (
          <StyledLoadingIndicator loading={true} loadingPosition='right' />
        )}

        {!props.isLoading && matchCountMessage(props.matchCount)}

        {props.searchQuery !== '' && (
          <ClearSearch
            href='#'
            onClick={(e) => {
              e.preventDefault();

              props.onChangeSearchQuery('');
            }}
          >
            <i className='fa fa-close' />
          </ClearSearch>
        )}
      </Search>

      <Sort>
        Sort by{' '}
        <StyledSortingDropdown
          value={props.sortOrder}
          setSortingOrder={props.onChangeSortOrder}
        />
      </Sort>
    </Wrapper>
  );
};

Toolbar.propTypes = {
  matchCount: PropTypes.number.isRequired,
  onChangeSearchQuery: PropTypes.func.isRequired,
  searchQuery: PropTypes.string.isRequired,
  onChangeSortOrder: PropTypes.func.isRequired,
  sortOrder: PropTypes.string.isRequired,
  isLoading: PropTypes.bool,
};

export default Toolbar;

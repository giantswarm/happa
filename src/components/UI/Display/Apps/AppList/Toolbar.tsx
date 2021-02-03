import PropTypes from 'prop-types';
import React from 'react';
import styled from 'styled-components';
import Input from 'UI/Inputs/Input';

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
`;

const SearchInput = styled(Input)`
  margin-right: 10px;
  margin-bottom: 0px;
  width: 280px;
`;

const StyledSortingDropdown = styled(SortingDropdown)`
  margin-left: 8px;
`;

const Sort = styled.div`
  display: flex;
  align-items: center;
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
}

const Toolbar: React.FC<IToolbarProps> = (props) => {
  return (
    <Wrapper>
      <Search>
        <SearchInput hideHint />
        {matchCountMessage(props.matchCount)}
      </Search>

      <Sort>
        Sort by <StyledSortingDropdown setSortingOrder={() => {}} />
      </Sort>
    </Wrapper>
  );
};

Toolbar.propTypes = {
  matchCount: PropTypes.number.isRequired,
};

export default Toolbar;

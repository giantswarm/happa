import PropTypes from 'prop-types';
import React from 'react';
import styled from 'styled-components';
import DropdownMenu, {
  DropdownTrigger,
  Link,
  List,
} from 'UI/Controls/DropdownMenu';

const Wrapper = styled.div`
  display: flex;
  align-items: center;
`;

const StyledDropdownTrigger = styled(DropdownTrigger)`
  width: unset;
  display: flex;
  align-items: center;
  padding: 0px 15px;
  background-color: ${({ theme }) => theme.colors.darkBlueDarker1};

  .caret {
    margin-left: 10px;
  }
`;

const StyledList = styled(List)``;

interface ISortingDropdownProps {
  setSortingOrder: (order: string) => void;
}

const SortingDropdown: React.FC<ISortingDropdownProps> = (props) => {
  return (
    <Wrapper {...props}>
      <DropdownMenu
        render={({
          isOpen,
          onClickHandler,
          onFocusHandler,
          onBlurHandler,
          onKeyDownHandler,
        }) => (
          <div onBlur={onBlurHandler} onFocus={onFocusHandler}>
            <StyledDropdownTrigger
              aria-expanded={isOpen}
              aria-haspopup='true'
              onClick={onClickHandler}
              onKeyDown={onKeyDownHandler}
              type='button'
            >
              Name
              <span className='caret' />
            </StyledDropdownTrigger>
            {isOpen && (
              <StyledList>
                <li role='presentation'>
                  <Link
                    href='#'
                    onClick={(e) => {
                      e.preventDefault();
                      props.setSortingOrder('Name');
                    }}
                  >
                    Name
                  </Link>
                </li>
                <li role='presentation'>
                  <Link
                    href='#'
                    onClick={(e) => {
                      e.preventDefault();
                      props.setSortingOrder('Catalog');
                    }}
                  >
                    Catalog
                  </Link>
                </li>
                <li role='presentation'>
                  <Link
                    href='#'
                    onClick={(e) => {
                      e.preventDefault();
                      props.setSortingOrder('Latest');
                    }}
                  >
                    Latest release (newest first)
                  </Link>
                </li>
                <li role='presentation'>
                  <Link
                    href='#'
                    onClick={(e) => {
                      e.preventDefault();
                      props.setSortingOrder('Relevance');
                    }}
                  >
                    Relevance for search term
                  </Link>
                </li>
              </StyledList>
            )}
          </div>
        )}
      />
    </Wrapper>
  );
};

SortingDropdown.propTypes = {
  setSortingOrder: PropTypes.func.isRequired,
};

export default SortingDropdown;

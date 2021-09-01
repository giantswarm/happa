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
  value: string;
  setSortingOrder: (order: string) => void;
}

const options: { [index: string]: string } = {
  name: 'Name',
  catalog: 'Catalog',
  latest: 'Latest release (newest first)',
};

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
              {options[props.value]}
              <span className='caret' />
            </StyledDropdownTrigger>
            {isOpen && (
              <StyledList>
                {Object.entries(options).map(([key, value]) => {
                  return (
                    <li role='presentation' key={key}>
                      <Link
                        href='#'
                        onClick={(e) => {
                          e.preventDefault();
                          props.setSortingOrder(key);
                          onBlurHandler();
                        }}
                      >
                        {value}
                      </Link>
                    </li>
                  );
                })}
              </StyledList>
            )}
          </div>
        )}
      />
    </Wrapper>
  );
};

export default SortingDropdown;

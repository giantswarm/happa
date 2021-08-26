import React from 'react';
import styled from 'styled-components';
import { DropdownTrigger } from 'UI/Controls/DropdownMenu';

const Bar = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  background: ${(props) => props.theme.colors.white3};
  height: 2px;
  margin: 2px 0;
  border-radius: 3px;
  transition: width 0.3s, transform 0.3s, opacity 0.3s;
  will-change: transform;
`;

const HamburgerDiv = styled(DropdownTrigger)`
  padding: 10px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  cursor: pointer;

  &.open {
    ${Bar}:nth-of-type(1), ${Bar}:nth-of-type(3) {
      width: 17.5px;
    }
    ${Bar}:nth-of-type(1) {
      transform: rotate(35deg) translate(4.2px, 5.5px);
    }
    ${Bar}:nth-of-type(2) {
      opacity: 0;
    }
    ${Bar}:nth-of-type(3) {
      transform: rotate(-35deg) translate(3.2px, -4px);
    }
  }
`;

function Hamburger({ onClickHandler, onKeyDownHandler, isOpen }) {
  function onClick() {
    onClickHandler();
  }

  return (
    <HamburgerDiv
      aria-expanded={isOpen}
      aria-haspopup='true'
      className={isOpen ? 'open' : ''}
      onClick={onClick}
      onKeyDown={onKeyDownHandler}
      type='button'
    >
      <Bar />
      <Bar />
      <Bar />
    </HamburgerDiv>
  );
}

export default Hamburger;

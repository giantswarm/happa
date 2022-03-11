import React from 'react';
import styled from 'styled-components';
import { DropdownTrigger } from 'UI/Controls/DropdownMenu';

const Bar = styled.div`
  position: absolute;
  left: 10px;
  background: ${(props) => props.theme.colors.white3};
  width: 20px;
  height: 2px;
  border-radius: 3px;
  transition: 0.2s ease-in-out;
  transition-property: transform, top, left, width;

  &:nth-of-type(1) {
    top: 12px;
  }

  &:nth-of-type(2),
  &:nth-of-type(3) {
    top: 19px;
  }

  &:nth-of-type(4) {
    top: 26px;
  }
`;

const HamburgerDiv = styled(DropdownTrigger)`
  position: relative;
  display: block;
  width: 40px;
  height: 40px;
  cursor: pointer;

  &.open {
    ${Bar}:nth-of-type(1), ${Bar}:nth-of-type(4) {
      top: 50%;
      left: 50%;
      width: 0;
    }

    ${Bar}:nth-of-type(2) {
      transform: rotate(45deg);
    }

    ${Bar}:nth-of-type(3) {
      transform: rotate(-45deg);
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
      <Bar />
    </HamburgerDiv>
  );
}

export default Hamburger;

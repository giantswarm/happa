import styled from '@emotion/styled';
import PropTypes from 'prop-types';
import React from 'react';

const HamburgerDiv = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  cursor: pointer;

  div {
    display: flex;
    flex-direction: column;
    justify-content: center;
    height: 100%;
  }

  /* Hamburger bars */
  .first,
  .second,
  .third {
    background: ${(props) => props.theme.colors.white3};
    height: 2px;
    margin: 2px 0;
    border-radius: 3px;
    transition: all 0.3s;
  }

  &.open {
    .first,
    .third {
      width: 17.5px;
    }
    .first {
      transform: rotate(35deg) translate(4.2px, 5.5px);
    }
    .second {
      opacity: 0;
    }
    .third {
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
      className={isOpen ? 'open dropdown-trigger' : 'dropdown-trigger'}
      onClick={onClick}
      onKeyDown={onKeyDownHandler}
      type='button'
    >
      <div>
        <div className='first' />
        <div className='second' />
        <div className='third' />
      </div>
    </HamburgerDiv>
  );
}

Hamburger.propTypes = {
  onClickHandler: PropTypes.func,
  onKeyDownHandler: PropTypes.func,
  isOpen: PropTypes.bool,
};

export default Hamburger;

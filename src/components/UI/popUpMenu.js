import PropTypes from 'prop-types';
import React from 'react';
import styled from '@emotion/styled';

/*
 * This is a reusable component following the render props pattern. It is responsible for:
 *
 * 1. Rendering a popover menu with some styles in it
 * 2. Provinding state and methods for handling the popover state in an accessible way
 *
 * For further customization - e.g. add custom positioning - please add props with defaultProp
 * in order to avoid introducing breaking changes
 */

const MenuWrapper = styled.div`
  button {
    width: 40px;
    height: 40px;
    /* Overrides for bootstrap */
    margin: 0;
    border-radius: 0;
    padding: 0;
    background: unset;
  }
  ul {
    position: absolute;
    right: 7px;
    list-style-type: none;
    padding: 12px 15px;
    margin: 0;
    width: 180px;
    background: ${props => props.theme.colors.shade2};
    border: 1px solid ${props => props.theme.colors.white3};
    z-index: 1;
    /* display: none; */
  }
  li {
    cursor: pointer;
  }
`;

class PopUpMenu extends React.Component {
  constructor(props) {
    super(props);

    this.state = { isOpen: false };
    this.timeOutId = null;

    this.onClickHandler = this.onClickHandler.bind(this);
    this.onBlurHandler = this.onBlurHandler.bind(this);
    this.onFocusHandler = this.onFocusHandler.bind(this);
  }

  onClickHandler() {
    this.setState(currentState => ({
      isOpen: !currentState.isOpen,
    }));
  }

  onBlurHandler() {
    this.timeOutId = setTimeout(() => {
      this.setState({
        isOpen: false,
      });
    });
  }

  // If a child receives focus, do not close the popover.
  onFocusHandler() {
    clearTimeout(this.timeOutId);
  }

  render() {
    const { render } = this.props;
    return (
      <MenuWrapper>
        {render({
          isOpen: this.state.isOpen,
          onClickHandler: this.onClickHandler,
          onBlurHandler: this.onBlurHandler,
          onFocusHandler: this.onFocusHandler,
        })}
      </MenuWrapper>
    );
  }
}

PopUpMenu.propTypes = {
  render: PropTypes.func,
};

export default PopUpMenu;

import PropTypes from 'prop-types';
import React from 'react';
import ReactDOM from 'react-dom';
import WindowScroller from '.';

class WindowScrollerAdapter extends React.Component {
  element = document.createElement('div');

  componentDidMount() {
    document.body.appendChild(this.element);
  }

  componentWillUnmount() {
    document.body.removeChild(this.element);
  }

  render() {
    return ReactDOM.createPortal(
      <WindowScroller onScroll={this.props.onScroll}>
        {() => <div />}
      </WindowScroller>,
      this.element
    );
  }
}

WindowScrollerAdapter.propTypes = {
  onScroll: PropTypes.func,
};

export default WindowScrollerAdapter;

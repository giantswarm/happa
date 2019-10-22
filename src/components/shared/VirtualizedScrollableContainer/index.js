import { FixedSizeList as List } from 'react-window';
import { WindowScroller } from 'react-virtualized';
import PropTypes from 'prop-types';
import React from 'react';

class VirtualizedScrollableContainer {
  container = React.createRef();

  static defaultProps = {
    height: window.innerHeight,
    width: window.innerWidth,
  };

  handleScroll = ({ scrollTop }) => {
    if (this.container.current !== null) this.container.scrollTo(scrollTop);
  };

  render() {
    return (
      <>
        <WindowScroller onScroll={this.handleScroll}>
          {() => <div />}
        </WindowScroller>
        <List
          ref={this.container}
          itemCount={this.props.itemCount}
          itemSize={this.props.itemHeight}
          width={this.props.width}
          height={this.props.height}
          className={this.props.className}
          style={this.props.style}
        >
          {({ index, style }) => <div style={style}>Row {index}</div>}
        </List>
      </>
    );
  }
}

VirtualizedScrollableContainer.propTypes = {
  itemHeight: PropTypes.number.isRequired,
  itemCount: PropTypes.number.isRequired,
  children: PropTypes.func.isRequired,
  height: PropTypes.number,
  width: PropTypes.number,
  className: PropTypes.string,
  style: PropTypes.object,
};

export default VirtualizedScrollableContainer;

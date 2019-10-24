import { FixedSizeGrid as List } from 'react-window';
import PropTypes from 'prop-types';
import React from 'react';
import WindowScrollerAdapter from './WindowScroller/WindowScrollerAdapter';

class VirtualizedScrollableGrid extends React.Component {
  container = React.createRef();

  static defaultProps = {
    height: window.innerHeight,
    width: window.innerWidth,
  };

  handleScroll = scrollDestination => {
    if (this.container.current !== null) {
      this.container.current.scrollTo(scrollDestination);
    }
  };

  render() {
    const { width, columnCount, data } = this.props;
    const columnWidth = width / columnCount;
    const rowCount = Math.ceil(data.length / columnCount);

    // Weird fix, together with setting `List`'s direction to 'rtl', to render elements in the correct order
    const newStyle = Object.assign({}, this.props.style, { direction: 'ltr' });

    return (
      <>
        <WindowScrollerAdapter onScroll={this.handleScroll} />
        <List
          direction='rtl'
          ref={this.container}
          columnCount={columnCount}
          rowCount={rowCount}
          rowHeight={this.props.rowHeight}
          columnWidth={columnWidth}
          width={width}
          height={this.props.height}
          className={this.props.className}
          style={newStyle}
        >
          {({ columnIndex, rowIndex, style }) => {
            const itemIndex = (rowIndex + 1) * columnCount - (columnIndex + 1);
            const item = data[itemIndex];

            if (!item) {
              return null;
            }

            return this.props.children(style, item);
          }}
        </List>
      </>
    );
  }
}

VirtualizedScrollableGrid.propTypes = {
  columnCount: PropTypes.number.isRequired,
  rowHeight: PropTypes.number.isRequired,
  children: PropTypes.func.isRequired,
  data: PropTypes.array.isRequired,
  height: PropTypes.number,
  width: PropTypes.number,
  className: PropTypes.string,
  style: PropTypes.object,
};

export default VirtualizedScrollableGrid;

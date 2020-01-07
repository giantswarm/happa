import { debounce } from 'underscore';
import { FixedSizeGrid as List } from 'react-window';
import { withTheme } from 'emotion-theming';
import PropTypes from 'prop-types';
import React from 'react';
import WindowScroller from 'react-virtualized/dist/commonjs/WindowScroller/WindowScroller';

const MIN_COLUMN_COUNT = 1;

class VirtualizedScrollableGrid extends React.PureComponent {
  gridRef = React.createRef();
  componentMounted = false;

  static defaultProps = {
    height: window.innerHeight,
    width: window.innerWidth,
    adaptWidthToElement: null,
  };

  state = {
    columnCount: 1,
    width: 0,
  };

  componentDidMount() {
    this.componentMounted = true;
    this.updateResponsiveFeatures();

    window.addEventListener('resize', this.updateResponsiveFeatures);
  }

  componentDidUpdate() {
    this.scrollToIndex(this.props.scrollToItemIndex, this.state.columnCount);
  }

  componentWillUnmount() {
    this.componentMounted = false;

    window.removeEventListener('resize', this.updateResponsiveFeatures);
  }

  scrollToIndex(index, colCount) {
    const { current: gridElement } = this.gridRef;

    if (gridElement && index !== -1) {
      const [rowIndex, columnIndex] = this.getGridIndexesFromAbsoluteIndex(
        index,
        colCount
      );

      gridElement.scrollToItem({
        align: 'center',
        rowIndex,
        columnIndex,
      });
    }
  }

  updateResponsiveFeatures = debounce(() => {
    const newState = Object.assign(
      {},
      this.setColumnCount(this.props),
      this.setWidth(this.props)
    );

    if (this.componentMounted) {
      this.setState(newState);
    }
  }, 300);

  setColumnCount(props) {
    const { theme, columnCount } = props;

    let columnCountToSet = MIN_COLUMN_COUNT;

    if (typeof columnCount === 'number') {
      columnCountToSet = columnCount;
    } else {
      const currentColumnCount = this.findCurrentColumnCount(
        columnCount,
        theme
      );
      const maximumColumnCount = Math.max(...Object.values(columnCount));

      if (currentColumnCount === null) {
        columnCountToSet = maximumColumnCount;
      } else {
        columnCountToSet = currentColumnCount;
      }
    }

    return {
      columnCount: columnCountToSet,
    };
  }

  setWidth(props) {
    const { adaptWidthToElement, width } = props;
    let widthToSet = 0;

    if (adaptWidthToElement === null) {
      widthToSet = width;
    } else {
      widthToSet = adaptWidthToElement.clientWidth;
    }

    return {
      width: widthToSet,
    };
  }

  handleScroll = scrollDestination => {
    const { current } = this.gridRef;

    if (current !== null) {
      current.scrollTo(scrollDestination);
    }
  };

  findCurrentColumnCount(columnCountObj, theme) {
    const windowWidth = window.innerWidth;

    const currentColumn = Object.keys(columnCountObj).find(breakpoint => {
      const currentBreakpointResolution = theme.breakpoints[breakpoint];

      return (
        typeof currentBreakpointResolution !== 'undefined' &&
        windowWidth < currentBreakpointResolution
      );
    });

    if (typeof currentColumn === 'undefined') return null;

    return columnCountObj[currentColumn];
  }

  getAbsoluteIndexFromGridIndexes(rowIndex, columnIndex, colCount) {
    return (rowIndex + 1) * colCount - (columnIndex + 1);
  }

  /**
   * Returns the grid indexes by knowing the item index
   * @param {Number} index Item Index
   * @param {Number} colCount Column Count
   * @returns {[Number, Number]} [RowIndex, ColIndex]
   */
  getGridIndexesFromAbsoluteIndex(index, colCount) {
    return [Math.floor(index / colCount), index % colCount];
  }

  render() {
    const { data } = this.props;
    const { columnCount, width } = this.state;
    const columnWidth = width / columnCount;
    const rowCount = Math.ceil(data.length / columnCount);

    // Weird fix, together with setting `List`'s direction to 'rtl', to render elements in the correct order
    const newStyle = Object.assign({}, this.props.style, { direction: 'ltr' });

    return (
      <WindowScroller onScroll={this.handleScroll}>
          {({ isScrolling, onChildScroll, scrollTop }) => (
            <List
              direction='rtl'
              ref={this.gridRef}
              columnCount={columnCount}
              rowCount={rowCount}
              rowHeight={this.props.rowHeight}
              columnWidth={columnWidth}
              width={width}
              height={this.props.height}
              isScrolling={isScrolling}
              onScroll={onChildScroll}
              scrollTop={scrollTop}
              className={this.props.className}
              style={newStyle}
            >
              {({ columnIndex, rowIndex, style }) => {
                const itemIndex = this.getAbsoluteIndexFromGridIndexes(
                  rowIndex,
                  columnIndex,
                  columnCount
                );
                const item = data[itemIndex];

                if (!item) {
                  return null;
                }

                return this.props.children(style, item);
              }}
            </List>
          )}
        </WindowScroller>
    );
  }
}

VirtualizedScrollableGrid.propTypes = {
  columnCount: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.shape({
      small: PropTypes.number,
      med: PropTypes.number,
      large: PropTypes.number,
    }),
  ]).isRequired,
  rowHeight: PropTypes.number.isRequired,
  children: PropTypes.func.isRequired,
  data: PropTypes.array.isRequired,
  height: PropTypes.number,
  width: PropTypes.number,
  scrollToItemIndex: PropTypes.number,
  className: PropTypes.string,
  adaptWidthToElement: PropTypes.object,
  style: PropTypes.object,
  theme: PropTypes.object,
};

export default withTheme(VirtualizedScrollableGrid);

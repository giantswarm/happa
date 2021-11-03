import React from 'react';
import { WindowScroller } from 'react-virtualized';
import { FixedSizeGrid as List } from 'react-window';
import { withTheme } from 'styled-components';
import { debounce } from 'underscore';

const MIN_COLUMN_COUNT = 1;
const RESPONSIVE_FEATURES_UPDATE_TIME = 300;

class VirtualizedScrollableGrid extends React.PureComponent {
  static defaultProps = {
    height: window.innerHeight,
    width: window.innerWidth,
    adaptWidthToElement: null,
  };

  static setWidth(params) {
    const { adaptWidthToElement, width } = params;
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

  gridRef = React.createRef();
  componentMounted = false;

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
      const [rowIndex, columnIndex] =
        VirtualizedScrollableGrid.getGridIndexesFromAbsoluteIndex(
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
    const { theme, columnCount, adaptWidthToElement, width } = this.props;
    const newState = Object.assign(
      {},
      VirtualizedScrollableGrid.setColumnCount({ theme, columnCount }),
      VirtualizedScrollableGrid.setWidth({ adaptWidthToElement, width })
    );

    if (this.componentMounted) {
      this.setState(newState);
    }
  }, RESPONSIVE_FEATURES_UPDATE_TIME);

  static setColumnCount(params) {
    const { theme, columnCount } = params;

    let columnCountToSet = MIN_COLUMN_COUNT;

    if (typeof columnCount === 'number') {
      columnCountToSet = columnCount;
    } else {
      const currentColumnCount =
        VirtualizedScrollableGrid.findCurrentColumnCount(columnCount, theme);
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

  handleScroll = (scrollDestination) => {
    const { current } = this.gridRef;

    if (current !== null) {
      current.scrollTo(scrollDestination);
    }
  };

  static findCurrentColumnCount(columnCountObj, theme) {
    const windowWidth = window.innerWidth;

    const currentColumn = Object.keys(columnCountObj).find((breakpoint) => {
      const currentBreakpointResolution = theme.breakpoints[breakpoint];

      return (
        typeof currentBreakpointResolution !== 'undefined' &&
        windowWidth < currentBreakpointResolution
      );
    });

    if (typeof currentColumn === 'undefined') return null;

    return columnCountObj[currentColumn];
  }

  static getAbsoluteIndexFromGridIndexes(rowIndex, columnIndex, colCount) {
    return (rowIndex + 1) * colCount - (columnIndex + 1);
  }

  /**
   * Returns the grid indexes by knowing the item index
   * @param {Number} index Item Index
   * @param {Number} colCount Column Count
   * @returns {[Number, Number]} [RowIndex, ColIndex]
   */
  static getGridIndexesFromAbsoluteIndex(index, colCount) {
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
              const itemIndex =
                VirtualizedScrollableGrid.getAbsoluteIndexFromGridIndexes(
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

export default withTheme(VirtualizedScrollableGrid);

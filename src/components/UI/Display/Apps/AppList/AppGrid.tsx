import React, { memo, useLayoutEffect, useRef, useState } from 'react';
import { WindowScroller } from 'react-virtualized';
import {
  areEqual,
  GridChildComponentProps,
  VariableSizeGrid,
} from 'react-window';
import styled from 'styled-components';
import { IAppProps } from 'UI/Display/Apps/AppList/App';

interface IAppList {
  items: IAppProps[];
  itemMinWidth: number;
  itemMinHeight: number;
  gridGap: number;
  render: (item: IAppProps, i: number) => React.ReactNode;
}

interface IScrollPosition {
  scrollTop: number;
}

interface IDataProps {
  items: IAppProps[];
  columnCount: number;
  gridGap: number;
  render: (item: IAppProps, i: number) => React.ReactNode;
}

const StyledContainer = styled.div<{ gridGap: number }>`
  margin: 0 -${(props) => props.gridGap / 2}px;
`;

const getIndex = (
  rowIndex: number,
  columnIndex: number,
  columnCount: number
) => {
  return rowIndex * columnCount + columnIndex;
};

const ItemRenderer: React.FC<GridChildComponentProps> = memo(
  ({ columnIndex, rowIndex, data, style }) => {
    const { items, columnCount, render, gridGap }: IDataProps = data;
    const index = getIndex(rowIndex, columnIndex, columnCount);
    const item = items[index];

    const patchedStyle = Object.assign({}, style, {
      padding: `0 ${gridGap / 2}px`,
    });

    return item ? <div style={patchedStyle}>{render(item, index)}</div> : null;
  },
  areEqual
);

const AppList: React.FC<IAppList> = ({
  items,
  itemMinWidth,
  itemMinHeight,
  gridGap,
  render,
}) => {
  const [width, setWidth] = useState<number>(0);

  const gridRef = useRef<VariableSizeGrid>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleScroll = ({ scrollTop }: IScrollPosition) => {
    if (gridRef.current) gridRef.current.scrollTo({ scrollTop });
  };

  useLayoutEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        setWidth(containerRef.current.getBoundingClientRect().width);
      }
      if (gridRef.current) {
        gridRef.current.resetAfterIndices({
          columnIndex: 0,
          rowIndex: 0,
        });
      }
    };
    handleResize();

    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const columnCount = Math.floor(width / (itemMinWidth + gridGap)) || 1;
  const rowCount = Math.floor(items.length / columnCount);

  const columnWidth = () => width / columnCount;
  const rowHeight = () => itemMinHeight + gridGap;

  const itemData: IDataProps = {
    items,
    columnCount,
    gridGap,
    render,
  };

  return (
    <StyledContainer ref={containerRef} gridGap={gridGap}>
      <WindowScroller onScroll={handleScroll}>
        {({ height }) => (
          <VariableSizeGrid
            ref={gridRef}
            width={width}
            height={height}
            columnWidth={columnWidth}
            rowHeight={rowHeight}
            columnCount={columnCount}
            rowCount={rowCount}
            itemData={itemData}
            overscanRowCount={10}
          >
            {ItemRenderer}
          </VariableSizeGrid>
        )}
      </WindowScroller>
    </StyledContainer>
  );
};

export default AppList;

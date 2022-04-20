import React, { memo, useLayoutEffect, useRef, useState } from 'react';
import { WindowScroller } from 'react-virtualized';
import {
  areEqual,
  GridChildComponentProps,
  VariableSizeGrid,
} from 'react-window';
import styled from 'styled-components';
import { IAppProps } from 'UI/Display/Apps/AppList/App';

interface IAppGridProps {
  items: IAppProps[];
  itemMinWidth: number;
  itemMinHeight: number;
  gridGap: number;
  render: (item: IAppProps) => React.ReactNode;
}

interface IScrollPosition {
  scrollTop: number;
}

interface IDataProps {
  items: IAppProps[];
  columnCount: number;
  gridGap: number;
  render: (item: IAppProps) => React.ReactNode;
}

const StyledContainer = styled.div<{ gridGap: number }>`
  margin: 0 -${(props) => props.gridGap / 2}px;
`;

const StyledGrid = styled(VariableSizeGrid)<{ minHeight: number }>`
  height: 100% !important;

  > div {
    height: ${(props) => props.minHeight}px !important;
  }
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

    return item ? <div style={patchedStyle}>{render(item)}</div> : null;
  },
  areEqual
);

const AppGrid: React.FC<React.PropsWithChildren<IAppGridProps>> = ({
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
  const rowCount = Math.ceil(items.length / columnCount);
  const minHeight = (itemMinHeight + gridGap) * rowCount;

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
          <StyledGrid
            ref={gridRef}
            width={width}
            height={height}
            columnWidth={columnWidth}
            rowHeight={rowHeight}
            columnCount={columnCount}
            rowCount={rowCount}
            itemData={itemData}
            overscanRowCount={10}
            minHeight={minHeight}
          >
            {ItemRenderer}
          </StyledGrid>
        )}
      </WindowScroller>
    </StyledContainer>
  );
};

export default AppGrid;

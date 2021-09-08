import useDebounce from 'lib/hooks/useDebounce';
import React, { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { WindowScroller } from 'react-virtualized';
import { FixedSizeGrid } from 'react-window';
import styled from 'styled-components';
import { IAppProps } from 'UI/Display/Apps/AppList/App';

interface IGridContainer extends React.PropsWithChildren<{}> {
  items: IAppProps[];
  itemMinWidth: number;
  itemMinHeight: number;
  gridGap: number;
  children: (item: IAppProps) => React.ReactNode;
}

interface IScrollPosition {
  scrollTop: number;
}

interface IAppWrapper {
  gridGap: number;
}

const GridContainer = styled.div`
  flex-grow: 1;
  margin: 0 -10px;
`;

const StyledGrid = styled(FixedSizeGrid)`
  width: 100% !important;
  height: 100% !important;
  overflow-x: hidden !important;
`;

const ItemWrapper = styled.div<IAppWrapper>`
  padding: ${({ gridGap }) => `0 ${gridGap / 2}px`};
`;

const getIndexFromGridPosition = (
  columnIndex: number,
  rowIndex: number,
  itemsPerRow: number
): number => {
  return itemsPerRow * rowIndex + columnIndex;
};

const getItemsPerRow = (itemMinWidth: number, containerWidth: number) => {
  return Math.floor(containerWidth / itemMinWidth) || 1;
};

const getElementDimensions = (refElement: ResizeObserverEntry) => {
  let width = 0;
  let height = 0;

  if (refElement) {
    const containerRefBoundingClient = refElement.contentRect;

    width = containerRefBoundingClient.width;
    height = window.innerHeight;
  }

  return { width, height };
};

const AppGrid: React.FC<IGridContainer> = ({
  items,
  itemMinWidth,
  itemMinHeight,
  gridGap,
  children,
}) => {
  const gridContainerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<FixedSizeGrid>(null);
  const [itemsPerRow, setItemsPerRow] = useState(1);
  const [gridDimensions, setGridDimensions] = useState({
    width: 0,
    height: 0,
  });
  const debouncedGridDimensions = useDebounce(gridDimensions, 150);

  const columnWidth = Math.floor(debouncedGridDimensions.width / itemsPerRow);
  const rowCount = Math.ceil(items.length / itemsPerRow);
  const rowHeight = itemMinHeight + gridGap;

  const handleResize = useCallback(
    (node) => {
      const dimensions = getElementDimensions(node);
      setGridDimensions(dimensions);

      const newItemsPerRow = getItemsPerRow(itemMinWidth, dimensions.width);
      setItemsPerRow(newItemsPerRow);
    },
    [itemMinWidth]
  );

  useLayoutEffect(() => {
    const observer = new ResizeObserver((entries) => handleResize(entries[0]));

    if (gridContainerRef.current) {
      observer.observe(gridContainerRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [gridContainerRef, handleResize]);

  const handleScroll = ({ scrollTop }: IScrollPosition) => {
    if (gridRef.current) gridRef.current.scrollTo({ scrollTop });
  };

  return (
    <>
      <WindowScroller onScroll={handleScroll}>{() => <div />}</WindowScroller>
      <GridContainer ref={gridContainerRef}>
        <StyledGrid
          ref={gridRef}
          width={debouncedGridDimensions.width}
          height={debouncedGridDimensions.height}
          columnCount={itemsPerRow}
          columnWidth={columnWidth}
          rowCount={rowCount}
          rowHeight={rowHeight}
          overscanRowCount={10}
        >
          {({ columnIndex, rowIndex, style }) => {
            const i = getIndexFromGridPosition(
              columnIndex,
              rowIndex,
              itemsPerRow
            );
            const item = items[i];

            return item ? (
              <ItemWrapper
                style={style}
                key={item.name + i.toString()}
                gridGap={gridGap}
              >
                {children(item)}
              </ItemWrapper>
            ) : null;
          }}
        </StyledGrid>
      </GridContainer>
    </>
  );
};

export default AppGrid;

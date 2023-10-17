import { css } from 'styled-components';

export const NodePoolGridRow = (
  extraColumnCount: number = 0,
  nameColumnWidth: number = 0,
  displayDescriptionColumn: boolean = true,
  displayMenuColumn: boolean = true
) => css`
  display: grid;
  grid-gap: 0 ${({ theme }) => theme.global.edgeSize.small};
  grid-template-columns:
    minmax(80px, ${nameColumnWidth}px)
    ${displayDescriptionColumn ? 'minmax(50px, 4fr)' : ''}
    4fr
    3fr
    repeat(2, 2fr)
    ${extraColumnCount ? `repeat(${extraColumnCount}, 2fr)` : ''}
    ${displayMenuColumn ? '1fr' : ''};
  grid-template-rows: ${({ theme }) => theme.global.size.xxsmall};
  justify-content: space-between;
  place-items: center normal;
  padding: ${({ theme }) =>
    `${theme.global.edgeSize.xsmall} ${theme.global.edgeSize.medium}`};
`;

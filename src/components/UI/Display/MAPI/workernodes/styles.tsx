import { css } from 'styled-components';

export const NodePoolGridRow = (
  extraColumnCount1: number = 0,
  extraColumnCount2: number = 0,
  nameColumnWidth: number = 0,
  displayDescriptionColumn: boolean = true,
  displayMachineTypeColumn: boolean = true,
  displayAvailabilityZonesColumn: boolean = true,
  displayMenuColumn: boolean = true
) => css`
  display: grid;
  grid-gap: 0 ${({ theme }) => theme.global.edgeSize.small};
  grid-template-columns:
    minmax(80px, ${nameColumnWidth}px)
    ${displayDescriptionColumn ? 'minmax(50px, 4fr)' : ''}
    ${displayMachineTypeColumn ? '4fr' : ''}
    ${displayAvailabilityZonesColumn ? '3fr' : ''}
    ${extraColumnCount1 ? `repeat(${extraColumnCount1}, 2fr)` : ''}
    repeat(2, 2fr)
    ${extraColumnCount2 ? `repeat(${extraColumnCount2}, 2fr)` : ''}
    ${displayMenuColumn ? '1fr' : ''};
  grid-template-rows: ${({ theme }) => theme.global.size.xxsmall};
  justify-content: space-between;
  place-items: center normal;
  padding: ${({ theme }) =>
    `${theme.global.edgeSize.xsmall} ${theme.global.edgeSize.medium}`};
`;

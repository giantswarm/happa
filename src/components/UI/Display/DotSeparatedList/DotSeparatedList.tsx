import { Box } from 'grommet';
import styled from 'styled-components';

export const DotSeparatedList = styled(Box).attrs({
  direction: 'row',
})`
  overflow: hidden;
`;

export const DotSeparatedListItem = styled.div`
  position: relative;
  padding: 0 16px;
  margin-left: -16px;

  &:last-child {
    padding-right: 0;
  }

  &::before {
    content: '·';
    position: absolute;
    left: 6px;
    top: 50%;
    transform: translateY(-50%);
  }
`;

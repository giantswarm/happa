import styled from '@emotion/styled';
import Tooltip from 'react-bootstrap/lib/Tooltip';

const tooltipThemeColor = 'darkBlueLighter2';

const EditValueTooltip = styled(Tooltip)`
  &.tooltip {
    opacity: 1;
    z-index: 9999;
  }
  .tooltip-inner {
    background-color: ${({ theme }) => theme.colors[tooltipThemeColor]};
  }
  &.top .tooltip-arrow {
    border-top-color: ${({ theme }) => theme.colors[tooltipThemeColor]};
  }
`;

export default EditValueTooltip;

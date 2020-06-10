import styled from '@emotion/styled';
import { baseLabelStyles } from 'styles/cluster-creation';

import Input from '../Inputs/Input';

const StyledInput = styled(Input)`
  .input-field-label {
    ${baseLabelStyles}
  }
`;

export const AdditionalInputHint = styled.p`
  margin: 0;
  font-size: 14px;
  line-height: 1.4;
  color: ${(props) => props.theme.colors.white1};
`;

export default StyledInput;

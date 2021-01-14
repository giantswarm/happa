import styled from 'styled-components';
import { Code } from 'styles';

const InstanceType = styled(Code)`
  background: ${({ theme }) => theme.colors.shade7};
  margin-right: 10px;
`;

export default InstanceType;

import styled from 'styled-components';

// Covers the background in a darker color.

const ShadowMask = styled.div`
  background-color: ${(props) => props.theme.colors.darkBlueDarker5};
  opacity: 1;
  top: 0px;
  bottom: 0px;
  left: 0px;
  right: 0px;
  position: fixed;
  display: block;
  z-index: 0;
`;

export default ShadowMask;

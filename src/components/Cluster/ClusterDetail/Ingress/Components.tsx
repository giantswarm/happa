import styled from '@emotion/styled';
import URIBlock from 'Cluster/ClusterDetail/URIBlock';
import { FlexRowBase, Row } from 'styles';

// Have to force component type as any, because of styled props not being inferred correctly
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const StyledURIBlock = styled<any>(URIBlock)`
  display: flex;
  align-items: center;
  width: 500px;
  max-width: 100%;

  code {
    margin-right: 1rem;
  }
`;

export const Description = styled.small`
  display: block;

  div + & {
    margin-top: 8px;
  }
`;

export const Info = styled.div`
  ${FlexRowBase};
  ${Row};
  background-color: ${(props) => props.theme.colors.shade7};
  flex-wrap: wrap;
`;

export const InfoRow = styled.div`
  display: flex;
  align-items: flex-start;
  flex-wrap: wrap;
  width: 100%;

  & + & {
    margin-top: 16px;
  }
`;

export const URIWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  max-width: 100%;
  overflow: hidden;
`;

export const Text = styled.p`
  margin: 0 0 20px;
  line-height: 1.2;
`;

export const Emphasis = styled.strong`
  font-weight: 700;
  font-size: inherit;
  color: inherit;
`;

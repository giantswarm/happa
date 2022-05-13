import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { Tooltip, TooltipContainer } from 'UI/Display/Tooltip';

import AppIcon from './AppIcon';
import CatalogLabel from './CatalogLabel';

const Wrapper = styled(Link)`
  display: flex;
  flex-direction: column;
  height: 200px;
  flex-grow: 1;
  border-radius: ${({ theme }) => theme.border_radius};
  border: 1px solid transparent;

  &:hover {
    text-decoration: none;
    border: 1px solid ${({ theme }) => theme.colors.darkBlueLighter2};
  }
`;

const IconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => theme.colors.darkBlueDarker4};
  padding: 20px;
  height: 55%;
  border-top-left-radius: ${({ theme }) => theme.border_radius};
  border-top-right-radius: ${({ theme }) => theme.border_radius};
`;

const DetailWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  background-color: ${({ theme }) => theme.colors.darkBlueDarker1};
  width: 100%;
  height: 45%;
  border-bottom-left-radius: ${({ theme }) => theme.border_radius};
  border-bottom-right-radius: ${({ theme }) => theme.border_radius};
  padding: 10px 20px;
  padding-bottom: 17px;
`;

const Name = styled.div`
  font-size: 18px;
`;

const StyledCatalogLabel = styled(CatalogLabel)`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.darkBlueLighter5};
`;
export interface IAppProps {
  to: string;
  name: string;
  appIconURL?: string;
  catalogTitle: string;
  catalogIconUrl: string;
  catalogIsManaged?: boolean;
  isInstalledInSelectedCluster?: boolean;
}

const App: React.FC<React.PropsWithChildren<IAppProps>> = (props) => {
  return (
    <Wrapper to={props.to} aria-label={props.name}>
      <IconWrapper>
        <AppIcon src={props.appIconURL} name={props.name} />
      </IconWrapper>
      <DetailWrapper>
        <Name>
          {props.name}{' '}
          {props.isInstalledInSelectedCluster && (
            <TooltipContainer
              content={<Tooltip>Installed in this cluster</Tooltip>}
            >
              <i
                className='fa fa-done'
                aria-hidden='true'
                title='Installed in this cluster'
              />
            </TooltipContainer>
          )}
        </Name>
        <StyledCatalogLabel
          catalogName={props.catalogTitle}
          isManaged={props.catalogIsManaged}
          iconUrl={props.catalogIconUrl}
        />
      </DetailWrapper>
    </Wrapper>
  );
};

export default App;

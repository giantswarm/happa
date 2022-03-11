import React from 'react';
import styled from 'styled-components';
import { Tooltip, TooltipContainer } from 'UI/Display/Tooltip';

const LOW_OPACITY = 0.4;
const NORMAL_OPACITY = 1;

const Wrapper = styled.div<{ hasError: boolean }>`
  display: flex;
  align-items: center;
  opacity: ${({ hasError }) => (hasError ? LOW_OPACITY : NORMAL_OPACITY)};
`;

const Icon = styled.img`
  width: 20px;
  margin-right: 6px;
`;

const CatalogType = styled.span`
  background-color: #8dc163;
  font-size: 10px;
  font-weight: 700;
  padding: 0px 6px;
  border-radius: 3px;
  margin-left: 8px;
  color: #222;
`;

const RedIcon = styled.i`
  color: ${({ theme }) => theme.colors.redOld};
`;

const IconArea = styled.div``;
const Text = styled.div``;

export interface ICatalogLabelProps {
  iconUrl?: string;
  catalogName: string;
  description?: string;
  isManaged?: boolean;
  error?: string;
}

const ErrorIcon: React.FC<{ name: string }> = ({ name }) => {
  return (
    <TooltipContainer
      content={
        <Tooltip id={`app-catalog-load-error-${name}`}>
          This app catalog could not be loaded. Apps from this catalog cannot be
          displayed.
        </Tooltip>
      }
    >
      <RedIcon className='fa fa-warning' />
    </TooltipContainer>
  );
};

const CatalogLabel: React.FC<ICatalogLabelProps> = (props) => {
  const text = (
    <span>
      {props.catalogName}
      {props.isManaged || props.catalogName === 'Giant Swarm Catalog' ? (
        <CatalogType>MANAGED</CatalogType>
      ) : null}
    </span>
  );

  return (
    <Wrapper {...props} hasError={Boolean(props.error)}>
      {props.iconUrl && (
        <IconArea>
          <Icon src={props.iconUrl} />
        </IconArea>
      )}
      <Text>
        {props.description && (
          <TooltipContainer
            content={
              <Tooltip id={`app-catalog-description-${props.catalogName}`}>
                {props.description}
              </Tooltip>
            }
          >
            {text}
          </TooltipContainer>
        )}

        {!props.description && text}

        {props.error && <ErrorIcon name={props.catalogName} />}
      </Text>
    </Wrapper>
  );
};

export default CatalogLabel;

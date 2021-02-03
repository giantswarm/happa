import PropTypes from 'prop-types';
import React from 'react';
import OverlayTrigger from 'react-bootstrap/lib/OverlayTrigger';
import Tooltip from 'react-bootstrap/lib/Tooltip';
import styled from 'styled-components';

const Wrapper = styled.div`
  &.hasError {
    opacity: 0.4;
  }
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

export interface ICatalogLabelProps {
  iconUrl: string;
  catalogName: string;
  isManaged?: boolean;
  error?: string;
}

const ErrorIcon: React.FC<{ name: string }> = ({ name }) => {
  return (
    <OverlayTrigger
      overlay={
        <Tooltip id={`app-catalog-load-error-${name}`}>
          This app catalog could not be loaded. Apps from this catalog cannot be
          displayed.
        </Tooltip>
      }
      placement='top'
    >
      <RedIcon className='fa fa-warning' />
    </OverlayTrigger>
  );
};

ErrorIcon.propTypes = {
  name: PropTypes.string.isRequired,
};

const CatalogLabel: React.FC<ICatalogLabelProps> = (props) => {
  return (
    <Wrapper {...props} className={props.error ? 'hasError' : ''}>
      <Icon src={props.iconUrl} />
      {props.catalogName}
      {props.isManaged && <CatalogType>MANAGED</CatalogType>}&nbsp;
      {props.error && <ErrorIcon name={props.catalogName} />}
    </Wrapper>
  );
};

CatalogLabel.propTypes = {
  iconUrl: PropTypes.string.isRequired,
  catalogName: PropTypes.string.isRequired,
  isManaged: PropTypes.bool,
  error: PropTypes.string,
};

export default CatalogLabel;

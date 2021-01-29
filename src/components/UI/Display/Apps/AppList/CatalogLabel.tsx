import PropTypes from 'prop-types';
import React from 'react';
import styled from 'styled-components';

const Wrapper = styled.div``;

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

export interface ICatalogLabelProps {
  iconUrl: string;
  catalogName: string;
  isManaged?: boolean;
}

const CatalogLabel: React.FC<ICatalogLabelProps> = (props) => {
  return (
    <Wrapper {...props}>
      <Icon src={props.iconUrl} />
      {props.catalogName}
      {props.isManaged && <CatalogType>MANAGED</CatalogType>}
    </Wrapper>
  );
};

CatalogLabel.propTypes = {
  iconUrl: PropTypes.string.isRequired,
  catalogName: PropTypes.string.isRequired,
  isManaged: PropTypes.bool,
};

export default CatalogLabel;

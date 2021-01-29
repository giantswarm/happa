import PropTypes from 'prop-types';
import React from 'react';
import styled from 'styled-components';
import Checkbox from 'UI/Inputs/Checkbox';

const Wrapper = styled.div`
  width: 270px;
  flex-shrink: 0;
`;

const CatalogList = styled.ul`
  padding: 0px;
  list-style-type: none;
`;

const ListItem = styled.li`
  display: flex;
  align-items: center;
`;

interface IFacetsProps {
  errorMessage?: string;
  options: IFacetOption[];
  onChange: (value: string, checked: boolean) => void;
}

export interface IFacetOption {
  value: string;
  checked: boolean;
  label: JSX.Element;
}

const Facets: React.FC<IFacetsProps> = (props) => {
  return (
    <Wrapper>
      <label>Filter by Catalog</label>
      <CatalogList>
        {props.options.map((o) => (
          <ListItem key={o.value}>
            <Checkbox
              checked={o.checked}
              onChange={props.onChange.bind(this, o.value)}
              label={o.label}
            />
          </ListItem>
        ))}
      </CatalogList>
      {props.errorMessage && <span>{props.errorMessage}</span>}
    </Wrapper>
  );
};

Facets.propTypes = {
  errorMessage: PropTypes.string,
  options: PropTypes.array.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default Facets;

import PropTypes from 'prop-types';
import React from 'react';
import styled from 'styled-components';
import CheckBoxInput from 'UI/Inputs/CheckBoxInput';

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
  onChange: (value: string, event: React.ChangeEvent<HTMLInputElement>) => void;
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
            <CheckBoxInput
              checked={o.checked}
              onChange={props.onChange.bind(this, o.value)}
              label={o.label}
              margin={{ bottom: 'none' }}
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

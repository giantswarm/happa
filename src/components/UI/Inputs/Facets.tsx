import PropTypes from 'prop-types';
import React from 'react';
import styled from 'styled-components';
import Button from 'UI/Controls/Button';
import CheckBoxInput from 'UI/Inputs/CheckBoxInput';

import FacetListItemLoadingPlaceholder from './FacetListItemLoadingPlaceholder';

const LOADING_COMPONENTS = new Array(6).fill(0);

const StyledButton = styled(Button)`
  margin-left: 0px;
`;

const Wrapper = styled.div`
  width: 270px;
  flex-shrink: 0;

  .btn.btn-sm {
    margin-left: 0px;
  }
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
  options: IFacetOption[];
  onChange: (value: string, checked: boolean) => void;
  errorMessage?: string;
  isLoading?: boolean;
}

export interface IFacetOption {
  value: string;
  checked: boolean;
  label: JSX.Element;
}

const Facets: React.FC<IFacetsProps> = (props) => {
  const onChangeFacet = (
    value: string,
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    props.onChange(value, event.target.checked);
  };

  const selectAll = () => {
    props.options.forEach((o) => {
      props.onChange(o.value, true);
    });
  };

  const selectNone = () => {
    props.options.forEach((o) => {
      props.onChange(o.value, false);
    });
  };

  return (
    <Wrapper>
      <label>Filter by Catalog</label>
      <br />
      <StyledButton bsSize='sm' onClick={selectAll}>
        Select all
      </StyledButton>{' '}
      <StyledButton bsSize='sm' onClick={selectNone}>
        Select none
      </StyledButton>
      <br />
      <br />
      <CatalogList>
        {props.isLoading &&
          LOADING_COMPONENTS.map((_, i) => (
            <ListItem key={i}>
              <FacetListItemLoadingPlaceholder margin={{ bottom: 'medium' }} />
            </ListItem>
          ))}

        {!props.isLoading &&
          props.options.map((o) => (
            <ListItem key={o.value}>
              <CheckBoxInput
                checked={o.checked}
                onChange={onChangeFacet.bind(this, o.value)}
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
  options: PropTypes.array.isRequired,
  onChange: PropTypes.func.isRequired,
  errorMessage: PropTypes.string,
  isLoading: PropTypes.bool,
};

export default Facets;

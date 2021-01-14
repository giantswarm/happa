import PropTypes from 'prop-types';
import React from 'react';
import styled from 'styled-components';

const LinkWrapper = styled.object`
  position: relative;
  z-index: 1;
`;

const CatalogExternalLink = (props) => {
  const onClick = (e) => {
    e.stopPropagation();

    props.onClick?.();
  };

  return (
    <LinkWrapper onClick={onClick}>
      <a {...props} target='_blank' rel='noopener noreferrer' />
    </LinkWrapper>
  );
};

CatalogExternalLink.propTypes = {
  onClick: PropTypes.func,
};

export default CatalogExternalLink;

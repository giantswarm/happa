import PropTypes from 'prop-types';
import React from 'react';
import styled from 'styles';

const LinkWrapper = styled.object`
  position: relative;
  z-index: 1;
`;

const CatalogExternalLink = props => {
  const onClick = e => {
    e.stopPropagation();

    // eslint-disable-next-line no-unused-expressions
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

import React from 'react';
import OverlayTrigger from 'react-bootstrap/lib/OverlayTrigger';
import Tooltip from 'react-bootstrap/lib/Tooltip';
import styled from 'styled-components';

const Wrapper = styled.div`
  font-size: 14px;
  display: inline-block;
  margin-bottom: 12px;
  margin-right: 10px;
  background-color: #1e4156;
  padding: 5px 6px 6px 8px;
  border-radius: 4px;

  span {
    margin-right: 5px;
  }

  .fa {
    font-size: 14px;
    position: relative;
    top: 1px;
  }
`;

/**
 * CatalogTypeLabel shows some information about a catalog depending on its type.
 */
const CatalogTypeLabel = (props) => {
  const { catalogType, className } = props;
  let icon = '';
  let message = '';

  const validCatalogTypes = ['community', 'incubator', 'test', 'internal'];

  // Early return if we're dealing with a unknown catalog type.
  if (!validCatalogTypes.includes(catalogType)) {
    return null;
  }

  switch (catalogType) {
    case 'internal':
      icon = 'eye-with-line';
      message =
        'Only Giant Swarm admins are able to see these catalogs. They usually contain apps for the management cluster.';
      break;
    case 'community':
      icon = 'warning';
      message =
        'Apps from this catalog will most likely not work on your cluster without some alterations to the security settings.';
      break;
    case 'incubator':
      icon = 'info';
      message =
        'These apps are a work in progress, but are made to work with your cluster. Feedback is appreciated!';
      break;
    case 'test':
      icon = 'info';
      message = `We're still getting these apps ready. They might not work at all.`;
      break;
    default:
      icon = '';
      message = '';
  }

  return (
    <Wrapper className={className}>
      <OverlayTrigger
        overlay={<Tooltip id='tooltip'>{message}</Tooltip>}
        placement='top'
      >
        <>
          <span>{catalogType}</span> <i className={`fa fa-${icon}`} />
        </>
      </OverlayTrigger>
    </Wrapper>
  );
};

export default CatalogTypeLabel;

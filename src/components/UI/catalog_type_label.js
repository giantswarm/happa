import OverlayTrigger from 'react-bootstrap/lib/OverlayTrigger';
import PropTypes from 'prop-types';
import React from 'react';
import styled from '@emotion/styled';
import Tooltip from 'react-bootstrap/lib/Tooltip';

const Wrapper = styled.div`
  font-size: 12px;
  display: inline-block;
  margin-bottom: 15px;

  span {
    background-color: #1e4156;
    padding: 4px 6px;
    border-radius: 4px;
    margin-right: 5px;
  }

  .fa {
    font-size: 16px;
    position: relative;
    top: 1px;
  }
`;

/**
 * CatalogTypeLabel shows some information about a catalog depending on its type.
 */
const CatalogTypeLabel = props => {
  var icon;
  var message;

  switch (props.catalogType) {
    case 'community':
      icon = 'warning';
      message =
        'Apps from this catalog will not work on your cluster without some alterations to the security settings.';
      break;
    case 'incubator':
      icon = 'info';
      message =
        'These apps are a work in progress, but are made to work with your cluster. Feedback is appreciated!';
      break;
    case 'test':
      icon = 'info';
      message =
        "We're still getting these apps ready. They might not work at all.";
      break;
    default:
      icon = '';
      message = '';
  }

  return (
    <>
      <Wrapper>
        <OverlayTrigger
          overlay={<Tooltip id='tooltip'>{message}</Tooltip>}
          placement='top'
        >
          <div>
            <span>{props.catalogType}</span> <i className={`fa fa-${icon}`} />
          </div>
        </OverlayTrigger>
      </Wrapper>
    </>
  );
};

CatalogTypeLabel.propTypes = {
  catalogType: PropTypes.string,
};

export default CatalogTypeLabel;

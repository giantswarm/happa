import PropTypes from 'prop-types';
import React from 'react';
import styled from '@emotion/styled';

const DescriptionList = styled.dl`
  margin: 0;

  dd {
    margin: 0;

    ul {
      margin-bottom: 15px;
      padding: 0;
      list-style-type: none;
    }

    li {
      margin: 0;
    }
  }
`;

const AppDetailsBody = props => {
  const { description, children } = props;
  return (
    <DescriptionList>
      {description && description !== '' && (
        <>
          <dt>
            <small>Description</small>
          </dt>
          <dd>
            <p>{description}</p>
          </dd>
        </>
      )}
      {children}
    </DescriptionList>
  );
};

AppDetailsBody.propTypes = {
  description: PropTypes.string,
  children: PropTypes.any,
};

export default AppDetailsBody;

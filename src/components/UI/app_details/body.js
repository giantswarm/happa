import PropTypes from 'prop-types';
import React from 'react';
import styled from '@emotion/styled';

const DescriptionList = styled.dl({
  margin: 0,

  small: {
    textTransform: 'uppercase',
    fontSize: 12,
  },

  dd: {
    margin: 0,
    ul: {
      marginBottom: 15,
      padding: 0,
      listStyleType: 'none',
    },
    li: {
      margin: 0,
    },
  },
});

const AppDetailsBody = props => {
  const { description, children } = props;
  return (
    <DescriptionList>
      {description && description !== '' && (
        <React.Fragment>
          <dt>
            <small>Description</small>
          </dt>
          <dd>
            <p>{description}</p>
          </dd>
        </React.Fragment>
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

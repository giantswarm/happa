import PropTypes from 'prop-types';
import React from 'react';
import styled from '@emotion/styled';

// const DescriptionTitle = styled.dt({
//   'small': {
//     fontWeight: 400
//   },
// });

// const DescriptionDetails = styled.dd({
//   margin: 0,
//   'ul': {
//     marginBottom: 15,
//     padding: 0,
//     listStyleType: 'none',
//   },
//   'li': {
//     margin: 0,
//   },
// });

const Code = styled.code({
  backgroundColor: 'transparent',
  padding: 0,
});

const AppDetailsItem = props => {
  const { label, data } = props;

  if (label === 'Home') {
    return (
      <React.Fragment>
        <dt>
          <small>Home</small>
        </dt>
        <dd>
          <p>
            <Code>
              <a href={data} rel='noopener noreferrer'>
                {data}
              </a>
            </Code>
          </p>
        </dd>
      </React.Fragment>
    );
  }

  return (
    <React.Fragment>
      <dt>
        <small>{props.label}</small>
      </dt>
      <dd>
        <ul>
          {data.map(data => (
            <li key={data}>
              <Code>
                <a href={data} rel='noopener noreferrer'>
                  {data}
                </a>
              </Code>
            </li>
          ))}
        </ul>
      </dd>
    </React.Fragment>
  );
};

AppDetailsItem.propTypes = {
  data: PropTypes.array,
  label: PropTypes.string,
};

export default AppDetailsItem;

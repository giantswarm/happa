import PropTypes from 'prop-types';
import React from 'react';
import styled from '@emotion/styled';

const Code = styled.code`
  background-color: transparent;
  padding: 0;
`;

const AppDetailsItem = props => {
  const { label, data } = props;

  return (
    <>
      <dt>
        <small>{label}</small>
      </dt>
      <dd>
        {label === 'Home' && (
          <p>
            <Code>
              <a href={data} rel='noopener noreferrer'>
                {data}
              </a>
            </Code>
          </p>
        )}
        {label !== 'Home' && (
          <ul>
            {data.map(app => (
              <li key={app}>
                <Code>
                  <a href={app} rel='noopener noreferrer'>
                    {app}
                  </a>
                </Code>
              </li>
            ))}
          </ul>
        )}
      </dd>
    </>
  );
};

AppDetailsItem.propTypes = {
  data: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
  label: PropTypes.string,
};

export default AppDetailsItem;

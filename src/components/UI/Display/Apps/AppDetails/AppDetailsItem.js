import React from 'react';
import styled from 'styled-components';

const Code = styled.code`
  background-color: transparent;
  padding: 0;
`;

const AppDetailsItem = (props) => {
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
              <a href={data} rel='noopener noreferrer' target='_blank'>
                {data}
              </a>
            </Code>
          </p>
        )}
        {label !== 'Home' && (
          <ul>
            {data.map((app) => (
              <li key={app}>
                <Code>
                  <a href={app} rel='noopener noreferrer' target='_blank'>
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

export default AppDetailsItem;

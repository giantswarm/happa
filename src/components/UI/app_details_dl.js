import PropTypes from 'prop-types';
import React from 'react';

const AppDetailsDL = props => (
  <React.Fragment>
    <small>{props.label}</small>
    <ul>
      {props.data.map(data => (
        <li className='source' key={data} >
          <code>
            <a href={data} rel='noopener noreferrer'>
              {data}
            </a>
          </code>
        </li>
      ))}
    </ul>
  </React.Fragment>
);

AppDetailsDL.propTypes = {
  data: PropTypes.array,
  label: PropTypes.string,
};

export default AppDetailsDL;
import PropTypes from 'prop-types';
import React from 'react';

const AppListSearch = props => {
  const { value } = props;

  return (
    <form>
      <div className='input-with-icon'>
        <i className='fa fa-search' />
        <input onChange={props.onChange} type='text' value={value} />
        {value && (
          <a className='clearQuery' onClick={props.onReset}>
            <i className='fa fa-close' />
          </a>
        )}
      </div>
    </form>
  );
};

AppListSearch.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func,
  onReset: PropTypes.func,
};

export default AppListSearch;

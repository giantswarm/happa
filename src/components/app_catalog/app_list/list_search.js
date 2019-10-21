import PropTypes from 'prop-types';
import React from 'react';

class AppListSearch extends React.Component {
  render() {
    const { value } = this.props;

    return (
      <form>
        <div className='input-with-icon'>
          <i className='fa fa-search' />
          <input
            onChange={this.props.onChange}
            type='text'
            value={value}
          />
          {value && (
            <a className='clearQuery' onClick={this.props.onReset}>
              <i className='fa fa-close' />
            </a>
          )}
        </div>
      </form>
    );
  }
}

AppListSearch.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func,
  onReset: PropTypes.func,
};

export default AppListSearch;
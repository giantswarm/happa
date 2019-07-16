import PropTypes from 'prop-types';
import React from 'react';

const Row = props => {
  return (
    <tr>
      <td
        className='clickable'
        data-orgid={props.organization.id}
        onClick={props.onClick}
      >
        {props.organization.id}
      </td>
      <td
        className='clickable'
        data-orgid={props.organization.id}
        onClick={props.onClick}
      >
        {props.clusters.length}
      </td>
      <td
        className='clickable'
        data-orgid={props.organization.id}
        onClick={props.onClick}
      >
        {props.organization.members.length}
      </td>
      <td>
        <div className='contextual'>
          <i
            className='fa fa-delete clickable'
            data-orgid={props.organization.id}
            onClick={props.onDelete}
            title='Delete this organization'
          />
        </div>
      </td>
    </tr>
  );
};

Row.propTypes = {
  onClick: PropTypes.func,
  onDelete: PropTypes.func,
  onSelect: PropTypes.func,
  organization: PropTypes.object,
  clusters: PropTypes.array,
};

export default Row;

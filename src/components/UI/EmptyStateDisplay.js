import PropTypes from 'prop-types';

// EmptyStateDisplay conditionally displays its children or a empty state
// component depending on a boolean prop.
//
// displayEmptyState bool
// emptyState object
// children object
const EmptyStateDisplay = props => {
  if (props.displayEmptyState) {
    return props.emptyState;
  } 
    
return props.children;
  
};

EmptyStateDisplay.propTypes = {
  children: PropTypes.object,
  displayEmptyState: PropTypes.bool,
  emptyState: PropTypes.object,
};

export default EmptyStateDisplay;

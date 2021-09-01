// EmptyStateDisplay conditionally displays its children or a empty state
// component depending on a boolean prop.
//
// displayEmptyState bool
// emptyState object
// children object
const EmptyStateDisplay = (props) => {
  if (props.displayEmptyState) {
    return props.emptyState;
  }

  return props.children;
};

export default EmptyStateDisplay;

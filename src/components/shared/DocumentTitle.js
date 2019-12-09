import PropTypes from 'prop-types';
import useDocumentTitle from 'lib/effects/useDocumentTitle';

const DocumentTitle = ({ title, children }) => {
  useDocumentTitle(title);

  return children;
};

DocumentTitle.defaultProps = {
  title: '',
};

DocumentTitle.propTypes = {
  title: PropTypes.string,
};

export default DocumentTitle;

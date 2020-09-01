import useDocumentTitle from 'lib/hooks/useDocumentTitle';
import PropTypes from 'prop-types';
import { useEffect } from 'react';

const DocumentTitle = ({ title, children }) => {
  const [_, setTitle] = useDocumentTitle(title);

  useEffect(() => {
    setTitle(title);
  }, [title, setTitle]);

  return children;
};

DocumentTitle.defaultProps = {
  title: '',
};

DocumentTitle.propTypes = {
  title: PropTypes.string,
};

export default DocumentTitle;

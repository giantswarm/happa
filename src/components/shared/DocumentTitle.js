import PropTypes from 'prop-types';
import useDocumentTitle from 'lib/effects/useDocumentTitle';
import { useEffect } from 'react';

const DocumentTitle = ({ title, children }) => {
  const [_, setTitle] = useDocumentTitle(title);

  useEffect(() => {
    setTitle(title);
  }, [title, setTitle]);

  return children;
};

DocumentTitle.defaultProps = {
  title: 'Giant Swarm',
};

DocumentTitle.propTypes = {
  title: PropTypes.string,
};

export default DocumentTitle;

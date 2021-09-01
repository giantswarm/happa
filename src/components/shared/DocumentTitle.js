import useDocumentTitle from 'lib/hooks/useDocumentTitle';
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

export default DocumentTitle;

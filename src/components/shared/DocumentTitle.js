import { useEffect } from 'react';
import useDocumentTitle from 'utils/hooks/useDocumentTitle';

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

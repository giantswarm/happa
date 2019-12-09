import { useEffect, useState } from 'react';

/**
 * Set a certain document title for when the component is mounted,
 * which will be reverted to the previous value once the component is unmounted
 * @param {String} defaultTitle Default title
 * @returns {[String, (newTitle: String) => void]} [currentTitle, titleSetter]
 */
function useDocumentTitle(defaultTitle) {
  const [title, setTitle] = useState(defaultTitle);

  useEffect(() => {
    const previousTitle = document.title;

    return () => {
      document.title = previousTitle;
    };
  }, []);

  useEffect(() => {
    document.title = title;
  }, [title]);

  return [title, setTitle];
}

export default useDocumentTitle;

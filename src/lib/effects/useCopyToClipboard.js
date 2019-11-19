import { useEffect, useState } from 'react';
import copy from 'copy-to-clipboard';

function useCopyToClipboard() {
  const [copiedText, copyToClipboard] = useState(null);

  useEffect(() => {
    if (copiedText) {
      copy(copiedText);
    }
  }, [copiedText]);

  return [copiedText !== null, copyToClipboard];
}

export default useCopyToClipboard;

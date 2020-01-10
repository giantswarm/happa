import copy from 'copy-to-clipboard';
import { useEffect, useState } from 'react';

/**
 * Hook for copying text to the user's clipboard
 *
 * Use setter to set value to null for resetting the copy state.
 * @returns {[Boolean, (textToCopy: string|null) => void]} [hasContentInClipboard, setClipboardContent]
 */
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

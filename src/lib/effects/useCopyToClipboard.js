import { useEffect, useState } from 'react';
import copy from 'copy-to-clipboard';

/**
 * Hook for copying text to the user's clipboard
 *
 * Use setter to set value to null for resetting the copy state.
 * @returns {[Boolean, (textToCopy: string|null) => void]} [isCopiedToClipboard, setCopyToClipboard]
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

import copy from 'copy-to-clipboard';
import { useEffect, useState } from 'react';

/**
 * Hook for copying text to the user's clipboard.
 *
 * Note: Set value to `null` for resetting the clipboard state.
 */
function useCopyToClipboard(): [
  hasContentInClipboard: boolean,
  setClipboardContent: (text: string | null) => void
] {
  const [copiedText, copyToClipboard] = useState<string | null>(null);

  useEffect(() => {
    if (copiedText) {
      copy(copiedText);
    }
  }, [copiedText]);

  return [copiedText !== null, copyToClipboard];
}

export default useCopyToClipboard;

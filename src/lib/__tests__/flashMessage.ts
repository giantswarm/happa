import {
  FlashMessage,
  forceRemoveAll,
  messageTTL,
  messageType,
} from 'lib/flashMessage';

describe('FlashMessage', () => {
  it(`won't display messages that are already in the queue by default`, () => {
    for (let i = 0; i < 6; i++) {
      new FlashMessage(
        `Yo! Something went wrong.`,
        messageType.ERROR,
        messageTTL.MEDIUM
      );
    }

    let notificationWrapper = document.querySelector(
      '.noty_layout'
    ) as HTMLElement;
    expect(notificationWrapper.children).toHaveLength(1);

    forceRemoveAll();

    new FlashMessage(
      `Yo! Something went wrong.`,
      messageType.ERROR,
      messageTTL.MEDIUM
    );
    new FlashMessage(
      `Yo! Something went wrong.`,
      messageType.ERROR,
      messageTTL.MEDIUM
    );
    new FlashMessage(
      `Yo! Something went wrong.`,
      messageType.INFO,
      messageTTL.MEDIUM
    );

    notificationWrapper = document.querySelector('.noty_layout') as HTMLElement;
    expect(notificationWrapper.children).toHaveLength(2);
  });
});

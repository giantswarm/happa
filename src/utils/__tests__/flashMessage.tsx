import { act, fireEvent, screen } from '@testing-library/react';
import React from 'react';
import { renderWithTheme } from 'test/renderUtils';
import {
  FlashMessage,
  forceRemoveAll,
  messageTTL,
  messageType,
} from 'utils/flashMessage';

describe('FlashMessage', () => {
  it(`won't display messages that are already in the queue by default`, async () => {
    // eslint-disable-next-line react/jsx-no-useless-fragment
    renderWithTheme(() => <></>, {});

    act(() => {
      for (let i = 0; i < 6; i++) {
        new FlashMessage(
          `Yo! Something went wrong.`,
          messageType.ERROR,
          messageTTL.MEDIUM
        );
      }
    });

    expect(
      await screen.findAllByText('Yo! Something went wrong.')
    ).toHaveLength(1);

    act(() => {
      forceRemoveAll();
    });

    expect(
      screen.queryByText('Yo! Something went wrong.')
    ).not.toBeInTheDocument();

    act(() => {
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

      /**
       * Create a message with the same text, but a different type,
       * so we can check if types are taken into consideration when
       * checking if a message already exists.
       */
      new FlashMessage(
        `Yo! Something went wrong.`,
        messageType.INFO,
        messageTTL.MEDIUM
      );
    });

    expect(
      await screen.findAllByText('Yo! Something went wrong.')
    ).toHaveLength(2);
  });

  it(`won't display duplicate messages after the first one has been closed`, async () => {
    // eslint-disable-next-line react/jsx-no-useless-fragment
    renderWithTheme(() => <></>, {});

    act(() => {
      new FlashMessage(
        `Sorry, your request failed.`,
        messageType.ERROR,
        messageTTL.MEDIUM
      );

      new FlashMessage(
        `Sorry, your request failed.`,
        messageType.ERROR,
        messageTTL.MEDIUM
      );
    });

    expect(
      await screen.findAllByText('Sorry, your request failed.')
    ).toHaveLength(1);

    fireEvent.click(screen.getByLabelText('Close'));

    expect(
      screen.queryByText('Sorry, your request failed.')
    ).not.toBeInTheDocument();
  });
});

import { Story } from '@storybook/react';
import { Box, Heading } from 'grommet';
import React from 'react';
import Button from 'UI/Controls/Button';
import Select from 'UI/Inputs/Select';
import TextInput from 'UI/Inputs/TextInput';
import { FlashMessage, messageTTL, messageType } from 'utils/flashMessage';

import { FlashMessagesController } from '../FlashMessagesController';
import FlashMessagesProvider from '../FlashMessagesProvider';

const FOREVER_TTL = 'Forever';

export const Configurable: Story<
  React.ComponentPropsWithoutRef<typeof FlashMessagesProvider>
> = (args) => {
  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const formValues = Object.fromEntries(formData);

    let ttl =
      formValues.ttl as unknown as typeof messageTTL[keyof typeof messageTTL];
    if ((ttl as unknown) === FOREVER_TTL) ttl = false;

    new FlashMessage(
      formValues.title,
      formValues.type as typeof messageType[keyof typeof messageType],
      ttl,
      formValues.subtitle
    );
  };

  const ttlValues = Object.values(messageTTL).map((v) => (v ? v : FOREVER_TTL));

  return (
    <>
      <Box
        margin='auto'
        width='large'
        pad='medium'
        round='small'
        background='background-front'
      >
        <Heading level='1'>Spawn a flash message</Heading>
        <form onSubmit={handleFormSubmit}>
          <TextInput name='title' label='Title' defaultValue='Some title' />
          <TextInput
            name='subtitle'
            label='Message'
            placeholder='Can be empty'
          />
          <Select
            name='type'
            label='Type'
            options={Object.values(messageType)}
            defaultValue='success'
          />
          <Select
            name='ttl'
            label='TTL'
            options={ttlValues}
            defaultValue={1500}
          />
          <Box justify='end' margin={{ top: 'medium' }} direction='row'>
            <Button type='submit' primary={true}>
              Spawn
            </Button>
          </Box>
        </form>
      </Box>
      <FlashMessagesProvider {...args} />
    </>
  );
};

const controller = FlashMessagesController.getInstance();

Configurable.args = {
  animate: true,
  controller,
};

Configurable.argTypes = {
  controller: {
    table: {
      disable: true,
    },
  },
};

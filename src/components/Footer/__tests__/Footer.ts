import nock from 'nock';
import { StatusCodes } from 'shared';
import { renderWithStore } from 'testUtils/renderUtils';

import Footer from '../Footer';

const mockMetadataResponse = (version: string): void => {
  nock('http://localhost')
    .get('/metadata.json')
    .reply(StatusCodes.Ok, { version });
};

describe('Footer', () => {
  it('renders without crashing', () => {
    mockMetadataResponse('123');
    renderWithStore(Footer);
  });
});

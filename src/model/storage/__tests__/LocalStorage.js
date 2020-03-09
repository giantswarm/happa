import LocalStorage from '../LocalStorage';

describe('LocalStorage', () => {
  const getItemMock = jest.fn();
  const setItemMock = jest.fn();

  const storageMock = {
    getItem: getItemMock,
    setItem: setItemMock,
  };

  beforeAll(() => {
    new LocalStorage(storageMock);
  });

  it('stores data into the persistent container', () => {
    const storage = LocalStorage.getInstance();
    storage.setValue('key', 'value');
    storage.setValue('key2', 'value2');
    storage.setValue('key3', 'value3');

    expect(storage.getValue('key')).toBe('value');
    expect(storage.getValue('key2')).toBe('value2');
    expect(storage.getValue('key3')).toBe('value3');

    // Non-defined value
    expect(storage.getValue('key4')).toBe(null);
  });
});

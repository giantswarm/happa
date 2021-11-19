import QueueImpl from 'utils/Queue';

describe('QueueImpl', () => {
  it('is empty to start with', () => {
    const queue = new QueueImpl<string>();
    expect(queue).toHaveLength(0);
  });

  it('adds entries', () => {
    const queue = new QueueImpl<string>();
    queue.add('some-test');
    queue.add('some-other-test');
    queue.add('some-very-cool-test');
    expect(queue).toHaveLength(3);
  });

  it('checks whether an entry is present or not', () => {
    const queue = new QueueImpl<string>();
    queue.add('some-test');
    queue.add('some-other-test');
    queue.add('some-very-cool-test');
    expect(queue.includes('some-test')).toBeTruthy();
    expect(queue.includes('some-very-cool-test')).toBeTruthy();
    expect(queue.includes('some-not-included-test')).toBeFalsy();
  });

  it(`can be looped over with a 'for' loop`, () => {
    const queue = new QueueImpl<string>();
    queue.add('some-test');
    queue.add('some-other-test');
    queue.add('some-very-cool-test');

    const discoveredEntries = [];
    for (const entry of queue) {
      discoveredEntries.push(entry);
    }

    expect(discoveredEntries).toStrictEqual([
      'some-test',
      'some-other-test',
      'some-very-cool-test',
    ]);
  });

  it('removes a desired entry', () => {
    const queue = new QueueImpl<string>();
    queue.add('some-test');
    queue.add('some-other-test');
    queue.add('some-very-cool-test');

    queue.remove('some-other-test');
    expect(queue.includes('some-other-test')).toBeFalsy();

    queue.remove('some-test');
    expect(queue.includes('some-test')).toBeFalsy();

    queue.remove('some-very-cool-test');
    expect(queue.includes('some-very-cool-test')).toBeFalsy();

    queue.remove('some-nonexistent-test');
    expect(queue.includes('some-nonexistent-test')).toBeFalsy();

    expect(queue).toHaveLength(0);
  });

  it('can be cleared', () => {
    const queue = new QueueImpl<string>();
    queue.add('some-test');
    queue.add('some-other-test');
    queue.add('some-very-cool-test');

    queue.clear();

    expect(queue.includes('some-other-test')).toBeFalsy();
    expect(queue.includes('some-test')).toBeFalsy();
    expect(queue.includes('some-very-cool-test')).toBeFalsy();
    expect(queue).toHaveLength(0);
  });

  it('can handle more complex types', () => {
    const obj1 = ['some-data', 'some-other-data'];
    const obj2 = ['some-cool-data', 'some-fine-data', 'other-data'];
    const obj3 = ['dat-data', 'dat-other-data', 'dat-cool-data'];

    const queue = new QueueImpl<string[]>();
    queue.add(obj1);
    queue.add(obj2);
    queue.add(obj3);

    expect(queue.includes(obj1)).toBeTruthy();
    expect(queue.includes(obj2)).toBeTruthy();
    expect(queue.includes(obj3)).toBeTruthy();

    queue.remove(obj1);
    expect(queue.includes(obj1)).toBeFalsy();

    queue.remove(obj2);
    expect(queue.includes(obj2)).toBeFalsy();

    queue.remove(obj3);
    expect(queue.includes(obj3)).toBeFalsy();
  });

  it('can be used as a generator', () => {
    const queue = new QueueImpl<string>();
    queue.add('some-test');
    queue.add('some-other-test');
    queue.add('some-very-cool-test');

    const generator = queue[Symbol.iterator]();
    expect(generator.next().value).toBe('some-test');
    expect(generator.next().value).toBe('some-other-test');
    expect(generator.next().value).toBe('some-very-cool-test');
    expect(generator.next().value).toBeNull();
  });
});

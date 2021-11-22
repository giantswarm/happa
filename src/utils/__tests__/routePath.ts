import RoutePath from '../routePath';

const BASE_ROUTE = 'app/happa';

describe('RoutePath', () => {
  it('can be instantiated with a path', () => {
    const route = new RoutePath(BASE_ROUTE);

    expect(route.value).toBe(BASE_ROUTE);
  });

  it('parses parameters and sets initial values for them', () => {
    const route = new RoutePath(`${BASE_ROUTE}/users/:user_id/posts/:post_id`);

    expect(route.params).toStrictEqual({
      user_id: 0,
      post_id: 0,
    });
    expect(route.value).toBe(`${BASE_ROUTE}/users/0/posts/0`);
  });

  it('replaces parameters in the path', () => {
    const route = new RoutePath(`${BASE_ROUTE}/users/:user_id/posts/:post_id`);

    // Setting them individually
    // eslint-disable-next-line no-magic-numbers
    route.setParameter('user_id', 351);
    route.setParameter('post_id', 'tas129fa');

    expect(route.params).toStrictEqual({
      user_id: 351,
      post_id: 'tas129fa',
    });
    expect(route.value).toBe(`${BASE_ROUTE}/users/351/posts/tas129fa`);

    // Setting them all at once
    route.params = {
      user_id: '1as24f',
      post_id: 2566,
    };

    expect(route.params).toStrictEqual({
      user_id: '1as24f',
      post_id: 2566,
    });
    expect(route.value).toBe(`${BASE_ROUTE}/users/1as24f/posts/2566`);
  });

  it('has an utility method for replacing parameter values', () => {
    const template = `${BASE_ROUTE}/users/:user_id/posts/:post_id/comments/:user_id`;

    let path = RoutePath.replaceParamValue(template, 'user_id', '1as24f');
    expect(path).toBe(
      `${BASE_ROUTE}/users/1as24f/posts/:post_id/comments/1as24f`
    );

    path = RoutePath.replaceParamValue(path, 'post_id', '2566');
    expect(path).toBe(`${BASE_ROUTE}/users/1as24f/posts/2566/comments/1as24f`);
  });

  it('only keeps valid parameters', () => {
    const route = new RoutePath(`${BASE_ROUTE}/users/:user_id/posts/:post_id`);
    route.params = {
      user_id: '1as24f',
      post_id: 2566,
      another_param: 512,
      yet_another_param: '1asd2',
    };

    expect(route.params).toStrictEqual({
      user_id: '1as24f',
      post_id: 2566,
    });
  });

  it('keeps original template unchanged', () => {
    const template = `${BASE_ROUTE}/users/:user_id/posts/:post_id`;
    const route = new RoutePath(template);

    route.params = {
      user_id: 351,
      post_id: 'tas129fa',
    };

    route.params = {
      user_id: '1as24f',
      post_id: 2566,
    };

    expect(route.originalTemplate).toBe(template);
  });

  it('restores values to default ones on clear or on incomplete parameter setting', () => {
    const route = new RoutePath(`${BASE_ROUTE}/users/:user_id/posts/:post_id`);
    route.params = {
      user_id: 351,
      post_id: 'tas129fa',
    };

    route.clear();

    expect(route.params).toStrictEqual({
      user_id: 0,
      post_id: 0,
    });

    route.params = {
      user_id: '1as24f',
      post_id: 2566,
    };

    route.params = {
      post_id: 6441,
    };

    expect(route.params).toStrictEqual({
      user_id: 0,
      post_id: 6441,
    });

    route.setParameter('post_id');

    expect(route.params).toStrictEqual({
      user_id: 0,
      post_id: 0,
    });
  });

  it('can be instantiated with a factory method', () => {
    let route = RoutePath.create(`${BASE_ROUTE}/users/:user_id/posts/:post_id`);
    expect(route.params).toStrictEqual({
      user_id: 0,
      post_id: 0,
    });
    expect(route.value).toBe(`${BASE_ROUTE}/users/0/posts/0`);

    route = RoutePath.create(`${BASE_ROUTE}/users/:user_id/posts/:post_id`, {
      user_id: '1as24f',
      post_id: 2566,
    });
    expect(route.params).toStrictEqual({
      user_id: '1as24f',
      post_id: 2566,
    });
    expect(route.value).toBe(`${BASE_ROUTE}/users/1as24f/posts/2566`);
  });

  it('can have a string path created with a factory method', () => {
    const routeValue = RoutePath.createUsablePath(
      `${BASE_ROUTE}/users/:user_id/posts/:post_id`,
      {
        user_id: '1as24f',
        post_id: 2566,
      }
    );

    expect(routeValue).toBe(`${BASE_ROUTE}/users/1as24f/posts/2566`);
  });

  it('gets the correct parameters from a path', () => {
    let params = RoutePath.getParametersFromPath(
      `${BASE_ROUTE}/users/:userid/posts/:postid`
    );
    expect(params).toStrictEqual({
      userid: 0,
      postid: 0,
    });

    // Can have a slash at the end
    params = RoutePath.getParametersFromPath(
      `${BASE_ROUTE}/users/:user_id/posts/:post_id/`
    );
    expect(params).toStrictEqual({
      user_id: 0,
      post_id: 0,
    });

    // Must be preceded by a `:` character
    params = RoutePath.getParametersFromPath(
      `${BASE_ROUTE}/users/user_id/posts/post_id`
    );
    expect(params).toStrictEqual({});

    // Can contain `-` characters
    params = RoutePath.getParametersFromPath(
      `${BASE_ROUTE}/users/:user-id/posts/:post-id`
    );
    expect(params).toStrictEqual({
      'user-id': 0,
      'post-id': 0,
    });

    // Can contain `_` characters
    params = RoutePath.getParametersFromPath(
      `${BASE_ROUTE}/users/:user_id/posts/:post_id`
    );
    expect(params).toStrictEqual({
      user_id: 0,
      post_id: 0,
    });

    // Can contain both uppercase and lowercase characters
    params = RoutePath.getParametersFromPath(
      `${BASE_ROUTE}/users/:userId/posts/:postId`
    );
    expect(params).toStrictEqual({
      userId: 0,
      postId: 0,
    });
  });

  it('parses already processed paths based on a known template', () => {
    const template = `${BASE_ROUTE}/users/:user_id/posts/:post_id`;
    let processedPath = `${BASE_ROUTE}/users/1as24f/posts/2566`;

    let route = RoutePath.parseWithTemplate(template, processedPath);

    expect(route.params).toStrictEqual({
      user_id: '1as24f',
      post_id: 2566,
    });

    processedPath = `${BASE_ROUTE}/users/1as24f/posts`;

    route = RoutePath.parseWithTemplate(template, processedPath);

    expect(route.params).toStrictEqual({
      user_id: '1as24f',
      post_id: 0,
    });
  });

  it('can be cloned with different parameters', () => {
    const route = RoutePath.create(
      `${BASE_ROUTE}/users/:user_id/posts/:post_id`,
      {
        user_id: '1as24f',
        post_id: 2566,
      }
    );

    let clonedRoute = route.clone({
      user_id: 351,
      post_id: 'tas129fa',
    });
    expect(clonedRoute).not.toEqual(route);
    expect(clonedRoute.params).toStrictEqual({
      user_id: 351,
      post_id: 'tas129fa',
    });
    expect(clonedRoute.value).toBe(`${BASE_ROUTE}/users/351/posts/tas129fa`);

    clonedRoute = route.clone();
    expect(clonedRoute).not.toEqual(route);
    expect(clonedRoute.params).toStrictEqual({
      user_id: 0,
      post_id: 0,
    });
    expect(clonedRoute.value).toBe(`${BASE_ROUTE}/users/0/posts/0`);
  });

  it('blocks setting the value by hand', () => {
    const route = RoutePath.create(
      `${BASE_ROUTE}/users/:user_id/posts/:post_id`,
      {
        user_id: '1as24f',
        post_id: 2566,
      }
    );

    route.value = 'test';

    expect(route.value).toBe(`${BASE_ROUTE}/users/1as24f/posts/2566`);
  });

  it('blocks setting the original template by hand', () => {
    const template = `${BASE_ROUTE}/users/:user_id/posts/:post_id`;
    const route = RoutePath.create(template, {
      user_id: '1as24f',
      post_id: 2566,
    });

    route.originalTemplate = 'test';

    expect(route.originalTemplate).toBe(template);
  });
});


module.exports = [{
  pattern: 'http://localhost:5000(.*)',
  fixtures: function (match, params, headers, context) {
    if (match[1].match(/\/recovery\/([a-z0-9]+)\/password\//i) === 0) {
      return { success: true };
    }

    if (match[1].indexOf('/recovery/') === 0) {
      return { is_valid: true };
    }
  },

  get: function (match, data) {
    return {
      body: data
    };
  },

  post: function (match, data) {
    return {
      status: 201,
      body: data
    };
  },
},
{
  pattern: 'https://localhost/(.*)',
  fixtures: function (match, params, headers, context) {
    if(match[1].indexOf('v4/auth-tokens/') === 0) {
      return { auth_token: 'adsdas2342424adadfgr' };
    }

    if(match[1].indexOf('v4/user/') === 0) {
      return { email: 'test@test.com' };
    }

    if(match[1].indexOf('v4/info') === 0) {
      return {};
    }
  },

  get: function (match, data) {
    return {
      body: data
    };
  },

  post: function (match, data) {
    return {
      status: 201,
      body: data
    };
  },
}];

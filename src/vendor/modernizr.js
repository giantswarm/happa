/*! modernizr 3.3.1 (Custom Build) | MIT *
 * https://modernizr.com/download/?-adownload-setclasses !*/
!(function(e, n, s) {
  function a(e, n) {
    return typeof e === n;
  }
  function o() {
    var e, n, s, o, t, i, f;
    for (var c in r)
      if (r.hasOwnProperty(c)) {
        if (
          ((e = []),
          (n = r[c]),
          n.name &&
            (e.push(n.name.toLowerCase()),
            n.options && n.options.aliases && n.options.aliases.length))
        )
          for (s = 0; s < n.options.aliases.length; s++)
            e.push(n.options.aliases[s].toLowerCase());
        for (o = a(n.fn, 'function') ? n.fn() : n.fn, t = 0; t < e.length; t++)
          (i = e[t]),
            (f = i.split('.')),
            1 === f.length
              ? (Modernizr[f[0]] = o)
              : (!Modernizr[f[0]] ||
                  Modernizr[f[0]] instanceof Boolean ||
                  (Modernizr[f[0]] = new Boolean(Modernizr[f[0]])),
                (Modernizr[f[0]][f[1]] = o)),
            l.push((o ? '' : 'no-') + f.join('-'));
      }
  }
  function t(e) {
    var n = c.className,
      s = Modernizr._config.classPrefix || '';
    if ((u && (n = n.baseVal), Modernizr._config.enableJSClass)) {
      var a = new RegExp('(^|\\s)' + s + 'no-js(\\s|$)');
      n = n.replace(a, '$1' + s + 'js$2');
    }
    Modernizr._config.enableClasses &&
      ((n += ' ' + s + e.join(' ' + s)),
      u ? (c.className.baseVal = n) : (c.className = n));
  }
  function i() {
    return 'function' != typeof n.createElement
      ? n.createElement(arguments[0])
      : u
      ? n.createElementNS.call(n, 'http://www.w3.org/2000/svg', arguments[0])
      : n.createElement.apply(n, arguments);
  }
  var l = [],
    r = [],
    f = {
      _version: '3.3.1',
      _config: {
        classPrefix: '',
        enableClasses: !0,
        enableJSClass: !0,
        usePrefixes: !0,
      },
      _q: [],
      on: function(e, n) {
        var s = this;
        setTimeout(function() {
          n(s[e]);
        }, 0);
      },
      addTest: function(e, n, s) {
        r.push({ name: e, fn: n, options: s });
      },
      addAsyncTest: function(e) {
        r.push({ name: null, fn: e });
      },
    },
    Modernizr = function() {};
  (Modernizr.prototype = f), (Modernizr = new Modernizr());
  var c = n.documentElement,
    u = 'svg' === c.nodeName.toLowerCase();
  Modernizr.addTest('adownload', !e.externalHost && 'download' in i('a')),
    o(),
    t(l),
    delete f.addTest,
    delete f.addAsyncTest;
  for (var d = 0; d < Modernizr._q.length; d++) Modernizr._q[d]();
  e.Modernizr = Modernizr;
})(window, document);

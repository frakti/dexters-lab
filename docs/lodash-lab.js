;(function (window) {
  function getUrl (libName, version) {
    switch (libName) {
      case 'lodash':
        return 'https://cdn.jsdelivr.net/lodash/' + version + '/lodash.min.js'

      case 'lodash/fp':
        return 'https://cdn.jsdelivr.net/g/lodash@' + version + '(lodash.min.js+lodash.fp.min.js)'
    }
  }

  function checkVersion (libName) {
    return window._.VERSION
  }

  function executeLodash (Wrapper, body, data) {
    var loWrapper = new Wrapper(window._)
    // eslint-disable-next-line no-new-func
    var func = new Function('_', 'data', body)
    var result = func(loWrapper.lodash, JSON.parse(data))

    return [result, loWrapper.stats]
  }

  window.switchLib = function (libName, version, cb) {
    console.info('Loading: ' + libName + ', Version: ' + version)

    const node = document.getElementById('active-playground-lib')
    if (node) {
      node.remove()
    }

    var script = document.createElement('script')
    script.setAttribute('id', 'active-playground-lib')
    script.setAttribute('type', 'text/javascript')
    script.setAttribute('src', getUrl(libName, version))
    document.getElementsByTagName('head')[0].appendChild(script)

    script.onload = function (e) {
      const version = checkVersion(libName)
      console.info('Loaded ' + version)
      window.activePlaygroundLib = libName
      cb(version)
    }
  }

  window.execute = function (Wrapper, body, data) {
    return executeLodash(Wrapper, body, data)
  }
})(window)

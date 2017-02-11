;(function (window) {
  window.switchLodash = function (version, cb) {
    const node = document.getElementById('lodash')
    if (node) {
      node.remove()
    }

    console.info('Loading version: ' + version)
    var script = document.createElement('script')
    script.setAttribute('id', 'lodash')
    script.setAttribute('type', 'text/javascript')
    script.setAttribute('src', 'https://cdn.jsdelivr.net/lodash/' + version + '/lodash.min.js')
    document.getElementsByTagName('head')[0].appendChild(script)

    script.onload = function (e) {
      console.info('Loaded ' + window._.VERSION)
      cb(window._.VERSION)
    }
  }

  window.execute = function (LodashWrapper, body, data) {
    var loWrapper = new LodashWrapper(window._)
    var func = new Function('_', 'data', body)
    var result = func(loWrapper.lodash, JSON.parse(data))

    return [result, loWrapper.stats]
  }
})(window)

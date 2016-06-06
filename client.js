'use strict'

class LodashWrapper {
  constructor (_) {
    this.steps = []
    this.lodash = _.runInContext().mixin(
      _(_) // let the Inception begins :-)
      .functions()
      .keyBy()
      .mapValues(function (funcName) {
        return function (...args) {
          const result = _[funcName](...args)

          steps.push({
            step,
            funcName,
            args: JSON.stringify(args),
            result: JSON.stringify(result, null, 2)
          })

          return result
        }
      })
      .value()
    )
  }

  get stats () {
    return this.steps
  }

  resetStats () {
    this.steps = []
  }
}

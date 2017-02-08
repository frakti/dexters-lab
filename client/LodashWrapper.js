'use strict'

export default class LodashWrapper {
  constructor (_) {
    this.steps = []
    const self = this
    let step = 1
    this.lodash = _.runInContext().mixin(
      _(_) // let the Inception begins :-)
      .functions()
      .keyBy()
      .mapValues(function (funcName) {
        return function (...args) {
          const result = _[funcName](...args)

          self.steps.push({
            step: step++,
            funcName,
            args: JSON.stringify(args, null, 2),
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

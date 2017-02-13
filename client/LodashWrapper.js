'use strict'

export default class LodashWrapper {
  constructor (_) {
    this.steps = []
    const self = this
    let step = 1
    // this.lodash = _.runInContext().mixin(
    //   _(_) // let the Inception begins :-)
    //   .functions()
    //   .keyBy()
    //   .mapValues(function (funcName) {
    //     return function (...args) {
    //       const result = _[funcName](...args)
    //
    //       self.steps.push({
    //         step: step++,
    //         funcName,
    //         args: JSON.stringify(args, null, 2),
    //         result: JSON.stringify(result, null, 2)
    //       })
    //
    //       return result
    //     }
    //   })
    //   .value()
    // )

    this.lodash = _.runInContext()

    // Proxy prototype methods
    _(this.lodash.prototype)
      .omit(['constructor', 'toJSON', 'value'])
      .forEach((body, name) => {
        const originalFunction = this.lodash.prototype[name]
        this.lodash.prototype[name] = function (...args) {
          const result = originalFunction.call(this, ...args)

          self.steps.push({
            step: step++,
            funcName: name,
            args: JSON.stringify(args, null, 2),
            result: JSON.stringify(result, null, 2)
          })

          return result
        }
      })
  }

  get stats () {
    return this.steps
  }

  resetStats () {
    this.steps = []
  }
}

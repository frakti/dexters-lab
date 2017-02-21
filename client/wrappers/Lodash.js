'use strict'

const shortcutFusionFunctions = ['last', 'head', 'first', 'find', 'findLast', 'reverse']
const cloneDeep = require('lodash/cloneDeep')

module.exports = class LodashWrapper {
  constructor (_) {
    this.steps = []
    this._ = _
  }

  record (name, isChained, args, result) {
    const _ = this._
    if (name === 'chain' || typeof (name) === 'undefined') {
      return
    }

    const last = _.last(this.steps)
    /**
    * When we use chaining, some of short fusion functions fire `thru`
    * making steps list confusing, We are going to remove that step.
    * Those methods are not marked as `isChained` they are
    * by default "not" chainable (you can't chain further as long as
    * you didn't use _.chain())
    */
    if (
      shortcutFusionFunctions.includes(name) &&
      last && last.funcName === 'thru' && last.isChained
    ) {
      this.steps.pop()
    }

    this.steps.push({
      funcName: name,
      isChained,
      args: cloneDeep(args),
      result: cloneDeep(result)
    })
  }

  get lodash () {
    const _ = this._

    const availableFunctions = _.keys(_)
    let isBeforeApply = false

    const handler = {
      get: (original, propertyName) => {
        // Don't proxy ...
        if (
          // when processing proxied method - lodash may call some other exposed API in the hood
          isBeforeApply ||
          // when property is not any official method
          !availableFunctions.includes(propertyName)
        ) {
          return original[propertyName]
        }

        original[propertyName].dexterLabFuncName = propertyName
        return new Proxy(original[propertyName], handler)
      },

      apply: (original, thisArg, args) => {
        isBeforeApply = true
        const result = original.apply(thisArg, args)
        isBeforeApply = false

        if (result && result.__wrapped__) {
          this.record(original.dexterLabFuncName, true, args, result.value())
          return new Proxy(result, handler)
        }

        this.record(original.dexterLabFuncName, false, args, result)
        return result
      }
    }

     // let the Inception begins :-)
    return new Proxy(_.runInContext(), handler)
  }

  get stats () {
    return this.steps
  }

  resetStats () {
    this.steps = []
  }
}

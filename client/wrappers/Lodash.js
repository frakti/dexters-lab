'use strict'

const shortcutFusionFunctions = ['last', 'head', 'first', 'find', 'findLast', 'reverse']

export default class LodashWrapper {
  constructor (_) {
    this.steps = []
    let step = 1

    const record = (name, isChained, args, result) => {
      if (name === 'chain' || typeof (name) === 'undefined') {
        return
      }

      const stringifiedArgs = JSON.stringify(args, (key, value) => {
        if (typeof (value) === 'function') return '<function>'
        return value
      }, 2)

      let inputDataPrefix = ''

      if (isChained) {
        inputDataPrefix = args.length > 0 ? '\n  <input>,' : '<input>'
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
        step: step++,
        funcName: name,
        isChained,
        execution: `${name}(${inputDataPrefix}${stringifiedArgs.slice(1, -1).replace(/"<function>"/, '<function>')})`,
        args: stringifiedArgs,
        result: JSON.stringify(result, null, 2)
      })
    }

    const availableFunctions = _.keys(_)

    const handler = {
      get: (original, propertyName) => {
        if (!availableFunctions.includes(propertyName)) {
          return original[propertyName]
        }

        // console.info(`Getting ${propertyName}`)
        original[propertyName].dexterLabFuncName = propertyName
        return new Proxy(original[propertyName], handler)
      },

      apply: (original, thisArg, args) => {
        // console.info(`Calling ${original.dexterLabFuncName}`)
        const result = original.apply(thisArg, args)

        if (result.__wrapped__) {
          record(original.dexterLabFuncName, true, args, result.value())
          return new Proxy(result, handler)
        }

        record(original.dexterLabFuncName, false, args, result)
        return result
      }
    }

     // let the Inception begins :-)
    this.lodash = new Proxy(_.runInContext(), handler)
  }

  get stats () {
    return this.steps
  }

  resetStats () {
    this.steps = []
  }
}

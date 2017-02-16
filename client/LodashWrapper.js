'use strict'

export default class LodashWrapper {
  constructor (_) {
    this.steps = []
    let step = 1

    const record = (name, isChained, args, result) => {
      if (name === 'chain' || typeof (name) === 'undefined') {
        return
      }

      const stringifiedArgs = JSON.stringify(args, null, 2)

      let inputDataPrefix = ''

      if (isChained) {
        inputDataPrefix = args.length > 0 ? '\n  <input>,' : '<input>'
      }

      this.steps.push({
        step: step++,
        funcName: name,
        isChained,
        execution: `${name}(${inputDataPrefix}${stringifiedArgs.slice(1, -1)})`,
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

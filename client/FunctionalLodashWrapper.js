'use strict'

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
        return new Proxy(original[propertyName], funcHandler)
      }
    }

    const funcHandler = {
      apply: (original, thisArg, args) => {
        const result = original.apply(thisArg, args)

        const wrapped = (func) => {
          return (...nextArgs) => {
            args.push(...nextArgs)

            const res = func.apply(thisArg, nextArgs)

            return summary(res)
          }
        }

        const summary = (res) => {
          if (typeof (res) === 'function') {
            return wrapped(res)
          }

          record(original.dexterLabFuncName, false, args, res)

          // Return final result
          return res
        }

        return summary(result)
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

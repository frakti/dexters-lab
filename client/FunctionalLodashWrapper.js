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

    const availableFunctions = _.reject(
      name => ['__', 'placeholder', 'VERSION'].includes(name),
      _.keys(_)
    )

    const concatArgs = (prevArgs, nextArgs) => {
      if (prevArgs.indexOf(this.lodash.__) === -1) {
        return prevArgs.concat(nextArgs)
      }

      const inputArgs = prevArgs.slice(0)
      const tempNextArgs = nextArgs.slice(0)
      // replace placeholders

      const i = inputArgs.indexOf(this.lodash.__)
      inputArgs[i] = tempNextArgs.shift()

      if (tempNextArgs.length > 0) return concatArgs(inputArgs, tempNextArgs)

      return inputArgs
    }

    const handler = {
      get: (original, propertyName) => {
        if (!availableFunctions.includes(propertyName)) {
          return original[propertyName]
        }

        original[propertyName].dexterLabFuncName = propertyName
        return new Proxy(original[propertyName], funcHandler)
      }
    }

    const funcHandler = {
      apply: (original, thisArg, args) => {
        const result = original.apply(thisArg, args)

        const wrapped = (prevArgs, func) => {
          return (...nextArgs) => {
            const inputArgs = concatArgs(prevArgs, nextArgs)

            const res = func.apply(thisArg, nextArgs)

            return summary(inputArgs, res)
          }
        }

        const summary = (inputArgs, res) => {
          if (typeof (res) === 'function') {
            return wrapped(inputArgs, res)
          }

          record(original.dexterLabFuncName, false, inputArgs, res)

          // Return final result
          return res
        }

        return summary(args, result)
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

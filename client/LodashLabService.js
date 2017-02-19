'use strict'

import LodashWrapper from './wrappers/Lodash'
import LodashFpWrapper from './wrappers/FunctionalLodash'

export default function LodashLabService (iframe) {
  let activePlaygroundLib = 'lodash'
  const lodashLab = iframe.contentWindow
  const runOnReady = (done) => {
    if (lodashLab.document.readyState === 'complete') {
      return done(lodashLab)
    }

    lodashLab.onload = () => done(lodashLab)
  }

  const pickWrapper = () => {
    if (activePlaygroundLib === 'lodash') return LodashWrapper
    if (activePlaygroundLib === 'lodash/fp') return LodashFpWrapper
  }

  return {
    switchLib: (libName, version, done = () => null) => {
      runOnReady(() => lodashLab.switchLib(libName, version, () => {
        activePlaygroundLib = libName
        done()
      }))
    },
    execute: (body, data) => lodashLab.execute(pickWrapper(), body, data),
    version: () => {
      return lodashLab._ ? lodashLab._.VERSION : null
    }
  }
}

'use strict'

import store from 'store'

export default class Storage {
  get isStorageEnabled () {
    return !!store.get('isStorageEnabled')
  }

  get config () {
    return store.get('config') || {}
  }

  save (params) {
    if (this.isStorageEnabled) {
      store.set('config', Object.assign(this.config, params))
    }
  }

  enable () {
    store.set('isStorageEnabled', true)
  }

  disable () {
    store.set('config', {})
    store.set('isStorageEnabled', false)
  }
}

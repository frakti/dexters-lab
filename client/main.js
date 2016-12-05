'use strict'

'use strict'

import React from 'react'
import ReactDOM from 'react-dom'
import Editor from './Editor'

const container = document.getElementById('react-root')

if (container) {
  ReactDOM.render(<Editor />, container)
}

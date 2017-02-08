'use strict'

import React from 'react'
import ReactDOM from 'react-dom'
import MainPage from './MainPage'

const container = document.getElementById('react-root')

if (container) {
  ReactDOM.render(<MainPage />, container)
}

'use strict'

import React, {PureComponent, PropTypes} from 'react'
import ace from 'brace'
import 'brace/mode/json'
import 'brace/mode/javascript'
import 'brace/theme/monokai'
import 'brace/ext/static_highlight'

const highlight = ace.acequire('ace/ext/static_highlight')

export default class Snippet extends PureComponent {
  static propTypes = {
    json: PropTypes.bool
  }

  highlight () {
    highlight(this.refs.editor, {
      mode: this.props.json ? 'ace/mode/json' : 'ace/mode/javascript',
      theme: 'ace/theme/monokai'
    })
  }

  componentDidMount () {
    this.highlight()
  }

  componentDidUpdate () {
    this.highlight()
  }

  render () {
    return <div ref='editor'>{this.props.children}</div>
  }
}

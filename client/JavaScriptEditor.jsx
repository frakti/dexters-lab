'use strict'

import React, {Component, PropTypes} from 'react'
import ace from 'brace'
import 'brace/mode/json'
import 'brace/mode/javascript'
import 'brace/theme/monokai'

export default class JavaScriptEditor extends Component {
  static propTypes = {
    onChange: PropTypes.func.isRequired,
    defaultValue: PropTypes.string,
    height: PropTypes.string,
    json: PropTypes.bool
  }

  static defaultProps = {
    readOnly: false,
    height: '200px'
  }

  componentDidMount () {
    this.editor = ace.edit(this.refs.editor)
    const session = this.editor.getSession()
    session.setMode(this.props.json ? 'ace/mode/json' : 'ace/mode/javascript')
    session.setTabSize(2)
    session.setUseWrapMode(true)
    this.editor.setTheme('ace/theme/monokai')
    this.editor.setValue(this.props.defaultValue || '')
    this.editor.clearSelection()
    this.editor.on('change', () => {
      this.props.onChange(session.getValue())
    })
    this.editor.setShowPrintMargin(false)
  }

  render () {
    return <div ref='editor' style={{width: '100%', height: this.props.height}} />
  }
}

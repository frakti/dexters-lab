'use strict'

import _ from 'lodash'
import React, {Component} from 'react'
import JavaScriptEditor from './JavaScriptEditor'

export default class Editor extends Component {
  state = {
    form: {
      content: '',
      data: ''
    }
  }

  onChangeContent = (content) => {
    this.setState(({form}) => _.set(form, 'content', content))
  }

  render () {
    const {form: {content}} = this.state
    let json = {}
    try {
      json = JSON.parse(this.state.data)
    } catch (e) {}

    return (
      <div>
        <div className='editors'>
            Editor
            <JavaScriptEditor
              onChange={this.onChangeContent}
              defaultValue={content}
            />
        </div>
        <div className='editors'>
            Data
            <JavaScriptEditor
              json
              onChange={(data) => this.setState({data})}
              defaultValue={this.state.data}
            />
        </div>
        <div className='preview'>
            Preview
            <pre>
              {JSON.stringify(json, null, 2)}
            </pre>
        </div>
      </div>
    )
  }
}

'use strict'

import _ from 'lodash'
import React, {Component} from 'react'
import JavaScriptEditor from './JavaScriptEditor'

export default class Editor extends Component {
  state = {
    form: {
      content: ''
    }
  }

  onChangeContent = (content) => {
    this.setState(({form}) => _.set(form, 'content', content))
  }

  render () {
    const {form: {content}} = this.state
    return (
      <div>
        <div className='editors'>
            Editor
            <JavaScriptEditor
              onChange={this.onChangeContent}
              defaultValue={content}
            />
        </div>
        <div className='preview'>
            Preview
        </div>
      </div>
    )
  }
}

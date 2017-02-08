'use strict'

import _ from 'lodash'
import React, {Component} from 'react'
import JavaScriptEditor from './JavaScriptEditor'
import LodashWrapper from './LodashWrapper'
export default class Editor extends Component {
  state = {
    content: '',
    data: '',
    stats: [],
    result: null,
    error: null
  }

  onChangeContent = (content) => {
    const {data} = this.state
    const loWrapper = new LodashWrapper(_)
    try {
      const func = new Function('_', 'data', content)
      const result = func(loWrapper.lodash, JSON.parse(this.state.data))

      this.setState({
        content,
        data,
        stats: loWrapper.stats,
        result,
        error: null
      })
    } catch (e) {
      console.error(e)
      this.setState({
        content,
        error: "Can't process, fix function or test data"
      })
    }
  }

  render () {
    const {content, data, stats, result, error} = this.state
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
              defaultValue={data}
            />
        </div>
        <div className='preview'>
          <b>{error}</b>
            <h3>Data</h3>
            <pre>
              {JSON.stringify(json, null, 2)}
            </pre>
            <h3>Steps</h3>
            {
              _.map(stats, (step) => {
                return <div key={step.step}>
                  Step: {step.step} <br />
                  Function: <pre>{step.funcName} </pre><br />
                  Args: <pre>{step.args}</pre><br />
                  Result: <pre>step.result}</pre>
                  <hr />
                </div>
              })
            }
            <h3>Result</h3>
            <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      </div>
    )
  }
}
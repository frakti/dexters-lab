'use strict'

import _ from 'lodash'
import React, {Component} from 'react'
import JavaScriptEditor from './JavaScriptEditor'
import LodashWrapper from './LodashWrapper'
import {Button, Grid, Row, Col} from 'react-bootstrap'

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

  onUseExample = () => {
    this.refs.editor.editor.setValue(`return _(data)
      .map('city')
      .sortBy()
      .value()`)

    this.refs.inputData.editor.setValue(`[{"city": "Rybnik"}, {"city": "Warszawa"}, {"city": "Katowice"}]`)
  }

  onBeautifyJson = () => {
    const {data} = this.state

    try {
      const json = JSON.parse(data)
      this.refs.inputData.editor.setValue(JSON.stringify(json, null, 2))
    } catch (e) {}
  }

  render () {
    const {content, data, stats, result, error} = this.state
    let json = {}
    try {
      json = JSON.parse(this.state.data)
    } catch (e) {}

    return (
      <Grid>
        <h2>LoDash Labs</h2>
        <Row>
          <Col md={6}>
            <h3>Editor</h3>
            <JavaScriptEditor
              ref='editor'
              onChange={this.onChangeContent}
              defaultValue={content}
            />
          <Button onClick={this.onUseExample}>Use example</Button>
          </Col>
          <Col md={6}>
            <h3>Input data</h3>
            <JavaScriptEditor
              ref='inputData'
              json
              onChange={(data) => this.setState({data})}
              defaultValue={data}
            />
            <Button onClick={this.onBeautifyJson}>Beautify JSON</Button>
          </Col>
        </Row>

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
      </Grid>
    )
  }
}

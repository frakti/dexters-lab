'use strict'

import _ from 'lodash'
import React, {Component} from 'react'
import JavaScriptEditor from './JavaScriptEditor'
import LodashWrapper from './LodashWrapper'
import {Alert, Button, Grid, Row, Col, Label} from 'react-bootstrap'
import packageJson from '../package.json'

export default class Editor extends Component {
  state = {
    content: '',
    data: '',
    stats: [],
    result: null,
    error: null
  }

  onChangeContent = (content) => {
    this.processContent(content)
  }

  processContent = (content) => {
    const {data} = this.state
    const loWrapper = new LodashWrapper(_)
    try {
      const func = new Function('_', 'data', content)
      const result = func(loWrapper.lodash, JSON.parse(this.state.data))

      this.setState((prevState) => {
        if (!_.isEqual(prevState.result, result)) {
          ga('send', 'event', 'Processor', 'new-result');
        }

        return {
          content,
          data,
          stats: loWrapper.stats,
          result,
          error: null
        }
      })
    } catch (e) {
      this.setState({
        content,
        error: "Can't process, fix function or test data"
      })
    }
  }

  onUseExample = () => {
    this.refs.inputData.editor.setValue(`[{"city": "Rybnik"}, {"city": "Warszawa"}, {"city": "Katowice"}]`)

    this.refs.editor.editor.setValue(`return _(data)
      .map('city')
      .sortBy()
      .value()`)

    // Temporal workaround to process content after replacing editor value
    setTimeout(() => this.processContent(this.state.content), 0)

    ga('send', 'event', 'Example', 'click');
  }

  onBeautifyJson = () => {
    const {data} = this.state

    try {
      const json = JSON.parse(data)
      this.refs.inputData.editor.setValue(JSON.stringify(json, null, 2));
      ga('send', 'event', 'Input Data', 'beautify');
    } catch (e) {}
  }

  render () {
    const {content, data, stats, result, error} = this.state

    return (
      <Grid>
        <h2 style={{marginBottom: 0}}>LoDash Labs</h2>
        <Label bsStyle="success">v{packageJson.version}</Label>
        {' '}
        <Label bsStyle="primary">lodash: {packageJson.dependencies.lodash}</Label>
        <Row>
          <Col md={6}>
            <h3>Editor</h3>
            <JavaScriptEditor
              ref='editor'
              onChange={this.onChangeContent}
              defaultValue={content}
            />
          <Button onClick={this.onUseExample} className='m-a'>Use example</Button>
          </Col>
          <Col md={6}>
            <h3>Input data</h3>
            <JavaScriptEditor
              ref='inputData'
              json
              onChange={(data) => {
                this.setState({data})
                this.processContent(this.state.content)
              }}
              defaultValue={data}
            />
            <Button onClick={this.onBeautifyJson} className='m-a'>Beautify JSON</Button>
          </Col>
        </Row>

        <div className='preview'>
          {error && <Alert bsStyle='danger' className='m-a'>{error}</Alert>}
          <h3>Result</h3>
          <pre>{JSON.stringify(result, null, 2)}</pre>
          <h3>Steps</h3>
          {
            _.map(stats, (step) => {
              return <Row key={step.step}>
                <Col md={1}>
                  Step: {step.step}
                </Col>
                <Col md={2}>
                  Function: <pre>{step.funcName}</pre>
                </Col>
                <Col md={6}>
                  Input: <pre>{step.args}</pre>
                </Col>
                <Col md={3}>
                  Output: <pre>{step.result}</pre>
                </Col>
                <hr />
              </Row>
            })
          }
        </div>
      </Grid>
    )
  }
}

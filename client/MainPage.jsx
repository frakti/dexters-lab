'use strict'

import _ from 'lodash'
import React, {Component} from 'react'
import JavaScriptEditor from './JavaScriptEditor'
import LodashLabService from './LodashLabService'
import {Alert, Button, Grid, Row, Col, Label, FormControl, InputGroup} from 'react-bootstrap'
import packageJson from '../package.json'
import copy from 'copy-to-clipboard'
import 'whatwg-fetch'
import Icon from 'react-fontawesome'

export default class Editor extends Component {
  state = {
    content: '',
    data: '',
    stats: [],
    currentVersion: null,
    versions: [],
    result: null,
    error: null,
    isLabLoaded: false
  }

  componentDidMount () {
    this.lodashLab = new LodashLabService(this.refs.lodashLab)

    fetch('http://api.jsdelivr.com/v1/jsdelivr/libraries/lodash')
      .then(response => response.json())
      .then(cdn => {
        const [{versions}] = cdn
        this.lodashLab.switchLodash(versions[0], () => {
          this.setState({currentVersion: versions[0], isLabLoaded: true})
        })

        this.setState({versions})
      })
  }

  onChangeContent = (content) => {
    this.processContent(content)
  }

  processContent = (content) => {
    const {data, isLabLoaded} = this.state

    if (!isLabLoaded) return

    try {
      const [result, stats] = this.lodashLab.execute(
        content,
        data.length > 0 ? data : null
      )

      this.setState((prevState) => {
        if (!_.isEqual(prevState.result, result)) {
          ga('send', 'event', 'Transformer', 'new-result', this.state.currentVersion);
        }

        return {
          content,
          data,
          stats,
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

    ga('send', 'event', 'Transformer', 'use-example', this.state.currentVersion);
  }

  onCopyToClipboard = () => {
    copy(this.state.content)
    ga('send', 'event', 'Transformer', 'copy-to-clipboard', this.state.currentVersion);
  }

  onBeautifyJson = () => {
    const {data} = this.state

    try {
      const json = JSON.parse(data)
      this.refs.inputData.editor.setValue(JSON.stringify(json, null, 2));
      ga('send', 'event', 'Input Data', 'beautify');
    } catch (e) {}
  }

  onSwitchLodashVersion = (event) => {
    const {target: {value}} = event

    this.setState({isLabLoaded: false})

    this.lodashLab.switchLodash(value, () => {
      this.setState({currentVersion: value, isLabLoaded: true})
      ga('send', 'event', 'Transformer', 'switch-version', value);
      this.processContent(this.state.content)
    })
  }

  render () {
    const {content, data, stats, result, error, versions, isLabLoaded} = this.state

    const loader = !isLabLoaded ? <Icon name='cog' spin fixedWidth /> : <span />
    return (
      <Grid>
        <h2 style={{marginBottom: 0}}>Dexter's Labs {loader}</h2>
        <Label bsStyle="success">v{packageJson.version}</Label>
        {' '}
        <br />
        <br />
        <InputGroup style={{width: '150px'}}>
          <InputGroup.Addon>Lodash</InputGroup.Addon>
          <FormControl componentClass="select" placeholder="select" onChange={this.onSwitchLodashVersion}>
            {_.map(versions, version => <option key={version}>{version}</option>)}
          </FormControl>
        </InputGroup>

        <Row>
          <Col md={6}>
            <h3>Editor</h3>
            <JavaScriptEditor
              ref='editor'
              onChange={this.onChangeContent}
              defaultValue={content}
            />
          <Button onClick={this.onUseExample} className='m-a'>Use example</Button>
          <Button onClick={this.onCopyToClipboard} className='m-a'>Copy to clipboard</Button>
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
        <iframe src='lodash.html' ref='lodashLab' style={{display: 'none'}} />
      </Grid>
    )
  }
}

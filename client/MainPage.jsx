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
    this.processContent(content, this.state.data)
  }

  processContent = (content, data) => {
    const {isLabLoaded} = this.state

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
    const data = `[{"city": "Rybnik"}, {"city": "Warszawa"}, {"city": "Katowice"}]`
    const content =`return _(data)
      .map('city')
      .sortBy()
      .value()`

    this.setState({data, content})

    this.refs.inputData.editor.setValue(data)
    this.refs.editor.editor.setValue(content)

    // Temporal workaround to process content after replacing editor value
    setTimeout(() => this.processContent(content, data), 0)

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

    this.lodashLab.switchLib('lodash', value, () => {
      this.setState({currentVersion: value, isLabLoaded: true})
      ga('send', 'event', 'Transformer', 'switch-version', value);
      this.processContent(this.state.content, this.state.data)
    })
  }

  render () {
    const {versions, isLabLoaded} = this.state
    const loader = !isLabLoaded ? <Icon name='cog' spin fixedWidth /> : <span />

    return (
      <div id='lab-layout'>
        <header>
          <h1 className='title'>Dexter's Lab <sup>v{packageJson.version}</sup> {loader}</h1>
        </header>
        <nav>
        lib:
        <FormControl className='lib-picker' componentClass='select'>
          <option>lodash</option>
        </FormControl>
        version:
        <FormControl className='lib-picker' componentClass='select'
          onChange={this.onSwitchLodashVersion}>
          {_.map(versions, version => <option key={version}>{version}</option>)}
        </FormControl>
        <div className='right-nav'>
          <a href='https://github.com/frakti/dexters-lab/issues'>Report a bug</a> <span className='delimiter'>|</span> <a href='https://github.com/frakti/dexters-lab'>GitHub</a>
        </div>
        </nav>

        {this.renderMain()}
      </div>
    )
  }

  renderMain () {
    const {content, data, stats, result, error, currentVersion} = this.state

    return (
      <main>
        <div id='editors'>
          <div id='function'>
            <h2>Editor</h2>
            <JavaScriptEditor
              ref='editor'
              onChange={this.onChangeContent}
              defaultValue={content}
              />
            <Button onClick={this.onUseExample} className='m-a'>Use example</Button>
            <Button onClick={this.onCopyToClipboard} className='m-a'>Copy to clipboard</Button>

          </div>

          <div id='input-data'>
            <h2>Input data</h2>
            <JavaScriptEditor
              ref='inputData'
              json
              onChange={(data) => {
                this.setState({data})
                this.processContent(this.state.content, data)
              }}
              defaultValue={data}
              />
            <Button onClick={this.onBeautifyJson} className='m-a'>Beautify JSON</Button>
          </div>

          <section>
              <small>
                  <h2>Tips</h2>
                  <ul>
                      <li>Use <code>return</code> statement to see result</li>
                      <li>Lodash is exported under <code>_</code> variable</li>
                      <li>Input data is available under <code>data</code> variable</li>
                  </ul>
              </small>
          </section>
        </div>

        <div id='results'>
          <div className='preview'>
            {error && <Alert bsStyle='danger' className='m-a'>{error}</Alert>}
            <h2>Result</h2>
            <pre>{JSON.stringify(result, null, 2)}</pre>
            <h2>Steps</h2>
            {
              _.map(stats, (step) => {
                const docLink = `https://lodash.com/docs/${currentVersion}#${step.funcName}`

                return <Row key={step.step}>
                  <Col md={1}>
                    <small>Step {step.step}:</small><br />
                    <a href={docLink} target="_blank">{step.funcName}</a>
                  </Col>
                  <Col md={6}>
                    <small>Invocation:</small> <pre>{step.execution}</pre>
                  </Col>
                  <Col md={5}>
                    <small>Output</small> <pre>{step.result}</pre>
                  </Col>
                  <hr />
                </Row>
              })
            }
          </div>
        </div>

        <iframe src='lodash.html' ref='lodashLab' style={{display: 'none'}} />
      </main>
    )
  }
}

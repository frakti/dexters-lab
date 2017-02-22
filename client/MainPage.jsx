/* global fetch, woopra */
'use strict'

import map from 'lodash/map'
import isEqual from 'lodash/isEqual'
import React, {Component} from 'react'
import JavaScriptEditor from './JavaScriptEditor'
import PlaygroundService from './PlaygroundService'
import {Alert, Button, Row, Col, FormControl} from 'react-bootstrap'
import packageJson from '../package.json'
import copy from 'copy-to-clipboard'
import 'whatwg-fetch'
import Icon from 'react-fontawesome'
import examplePicker from './examplePicker'
import stepsPrettifier from './stepsPrettifier'
import Snippet from './Snippet'
import beautify from 'json-beautify'

export default class MainPage extends Component {
  state = {
    content: '',
    data: '',
    stats: [],
    currentLib: 'lodash',
    currentVersion: null,
    versions: [],
    result: null,
    error: null,
    isLabLoaded: false
  }

  componentDidMount () {
    this.playgroundService = new PlaygroundService(this.refs.lodashLab)

    fetch('http://api.jsdelivr.com/v1/jsdelivr/libraries/lodash')
      .then(response => response.json())
      .then(cdn => {
        const [{versions}] = cdn
        this.playgroundService.switchLib(this.state.currentLib, versions[0], () => {
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

    if (!isLabLoaded || (isEqual(content, this.state.content) && isEqual(data, this.state.data))) return

    try {
      const [result, stats] = this.playgroundService.execute(
        content,
        data.length > 0 ? data : null
      )

      this.setState((prevState) => {
        if (!isEqual(prevState.result, result) && content) {
          woopra.track('new-result', {
            version: this.state.currentVersion,
            library: this.state.currentLib
          })
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
    const example = examplePicker(this.state.currentLib)
    this.setState(example)

    this.processContent(example.content, example.data)

    setTimeout(() => {
      // Temporal workaround to update editor value after processed the content
      this.refs.inputData.editor.setValue(example.data)
      this.refs.editor.editor.setValue(example.content)
    }, 10)

    woopra.track('use-example', {
      version: this.state.currentVersion,
      library: this.state.currentLib
    })
  }

  onCopyToClipboard = () => {
    copy(this.state.content)
    woopra.track('copy-to-clipboard', {
      version: this.state.currentVersion,
      library: this.state.currentLib
    })
  }

  onBeautifyJson = () => {
    const {data} = this.state

    try {
      const json = JSON.parse(data)
      this.refs.inputData.editor.setValue(beautify(json, null, 2, 50))
      woopra.track('beautify-input-data', {
        version: this.state.currentVersion,
        library: this.state.currentLib
      })
    } catch (e) {}
  }

  onSwitchLib = (event) => {
    const {target: {value}} = event

    this.setState({isLabLoaded: false})

    this.playgroundService.switchLib(value, this.state.currentVersion, () => {
      this.setState({currentLib: value, isLabLoaded: true})
      woopra.track('switch-library', {
        version: this.state.currentVersion,
        library: value
      })
      this.processContent(this.state.content, this.state.data)
    })
  }

  onSwitchLodashVersion = (event) => {
    const {target: {value}} = event

    this.setState({isLabLoaded: false})

    this.playgroundService.switchLib(this.state.currentLib, value, () => {
      this.setState({currentVersion: value, isLabLoaded: true})
      woopra.track('switch-version', {
        version: value,
        library: this.state.currentLib
      })
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
          <FormControl className='lib-picker' componentClass='select'
            onChange={this.onSwitchLib} disabled={!isLabLoaded}
          >
            <option>lodash</option>
            <option>lodash/fp</option>
          </FormControl>
          version:
          <FormControl className='lib-picker' componentClass='select'
            onChange={this.onSwitchLodashVersion} disabled={!isLabLoaded}
          >
            {map(versions, version => <option key={version}>{version}</option>)}
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
    const {content, data, stats, result} = this.state

    const isNothingUsefulToSee = !result && stats.length === 0

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
              onChange={(data) => this.processContent(this.state.content, data)}
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
          { isNothingUsefulToSee && this.renderAbout() }
          { !isNothingUsefulToSee && this.renderStats() }
        </div>

        <iframe src='lodash.html' ref='lodashLab' style={{display: 'none'}} />
      </main>
    )
  }

  renderStats () {
    const {stats, result, error, currentVersion} = this.state

    return <div className='preview'>
      {error && <Alert bsStyle='danger' className='m-a'>{error}</Alert>}
      <h2>Result</h2>
      <Snippet json>{beautify(result, null, 2, 80)}</Snippet>
      <h2>Usages</h2>
      {
        map(stepsPrettifier(stats), (step, i) => {
          const docLink = `https://lodash.com/docs/${currentVersion}#${step.funcName}`

          return <Row key={i}>
            <Col md={1}>
              <small>{i + 1})</small><br />
              <a href={docLink} target='_blank'>{step.funcName}</a>
            </Col>
            <Col md={6}>
              <small>Invocation:</small> <Snippet>{step.execution}</Snippet>
            </Col>
            <Col md={5}>
              <small>Output</small> <Snippet json>{step.result}</Snippet>
            </Col>
            <hr />
          </Row>
        })
      }
    </div>
  }

  renderAbout () {
    return <div>

      <h1 className='welcome'>Welcome in the <span style={{color: '#A6E22E'}}>Lab</span>!</h1>
      <p>
        This is a place where you can experiment with Lodash and Lodash FP (soon Ramda as well!),
        and see what is an output of your transform function. The true magic of this tool
        can be seen when you start using chaining or composition. All steps "in-between" are shown as well.
        Just start typing or use example.
      </p>
      <p>
        It is <strong>free</strong> and open source.
      </p>
      <p>
        If you find a bug or have some special needs or ideas, don't hesitate to create and Issue on GitHub.
      </p>
      <p>
        The tool is created and maintained by <a href='https://github.com/frakti'>Tomasz Sikora</a>.
      </p>
    </div>
  }
}

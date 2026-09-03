import { Component } from 'react'

/**
 * Every WebGL flourish on this page is optional. If one throws, it disappears
 * and the static design underneath is what you get — no broken frame, no
 * unhandled error reaching the console beyond React's own report.
 */
export default class Safe extends Component {
  constructor(props) {
    super(props)
    this.state = { failed: false }
  }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch() {
    this.props.onFail?.()
  }

  render() {
    if (this.state.failed) return this.props.fallback ?? null
    return this.props.children
  }
}

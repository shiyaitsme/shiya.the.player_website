import { Component } from 'react'

/**
 * Tiny error boundary for the 3D butterfly. If WebGL is unavailable or the FBX
 * fails to load, we silently render nothing instead of taking the Works page
 * down with us. (The butterfly is a delightful extra, never load-bearing.)
 */
export default class SafeMount extends Component {
  constructor(props) {
    super(props)
    this.state = { failed: false }
  }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch(err) {
    // keep it quiet in prod; useful in dev
    if (import.meta.env?.DEV) console.warn('[ButterflyEgg] disabled:', err?.message)
  }

  render() {
    if (this.state.failed) return null
    return this.props.children
  }
}

// Polyfills for Jest testing environment

// TextEncoder/TextDecoder polyfill
const { TextEncoder, TextDecoder } = require('util')
global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder

// Fetch polyfill
global.fetch = require('jest-fetch-mock')

// URL polyfill
const { URL, URLSearchParams } = require('url')
global.URL = URL
global.URLSearchParams = URLSearchParams

// Crypto polyfill for Node.js
const crypto = require('crypto')
Object.defineProperty(global, 'crypto', {
  value: {
    getRandomValues: (arr) => crypto.randomBytes(arr.length),
    randomUUID: () => crypto.randomUUID(),
  },
})

// Performance polyfill
global.performance = {
  now: () => Date.now(),
  mark: () => {},
  measure: () => {},
  getEntriesByName: () => [],
  getEntriesByType: () => [],
}

// File and Blob polyfills
global.File = class File {
  constructor(chunks, filename, options = {}) {
    this.chunks = chunks
    this.name = filename
    this.type = options.type || ''
    this.lastModified = options.lastModified || Date.now()
    this.size = chunks.reduce((acc, chunk) => acc + chunk.length, 0)
  }
}

global.Blob = class Blob {
  constructor(chunks = [], options = {}) {
    this.chunks = chunks
    this.type = options.type || ''
    this.size = chunks.reduce((acc, chunk) => acc + chunk.length, 0)
  }
  
  text() {
    return Promise.resolve(this.chunks.join(''))
  }
  
  arrayBuffer() {
    return Promise.resolve(new ArrayBuffer(this.size))
  }
}

// FileReader polyfill
global.FileReader = class FileReader {
  constructor() {
    this.readyState = 0
    this.result = null
    this.error = null
    this.onload = null
    this.onerror = null
    this.onloadend = null
  }
  
  readAsText(file) {
    setTimeout(() => {
      this.readyState = 2
      this.result = file.chunks ? file.chunks.join('') : ''
      if (this.onload) this.onload({ target: this })
      if (this.onloadend) this.onloadend({ target: this })
    }, 0)
  }
  
  readAsDataURL(file) {
    setTimeout(() => {
      this.readyState = 2
      this.result = `data:${file.type};base64,${Buffer.from(file.chunks.join('')).toString('base64')}`
      if (this.onload) this.onload({ target: this })
      if (this.onloadend) this.onloadend({ target: this })
    }, 0)
  }
}

// Canvas polyfill
global.HTMLCanvasElement = class HTMLCanvasElement {
  constructor() {
    this.width = 300
    this.height = 150
  }
  
  getContext() {
    return {
      fillRect: () => {},
      clearRect: () => {},
      getImageData: () => ({ data: new Array(4) }),
      putImageData: () => {},
      createImageData: () => ({ data: new Array(4) }),
      setTransform: () => {},
      drawImage: () => {},
      save: () => {},
      fillText: () => {},
      restore: () => {},
      beginPath: () => {},
      moveTo: () => {},
      lineTo: () => {},
      closePath: () => {},
      stroke: () => {},
      translate: () => {},
      scale: () => {},
      rotate: () => {},
      arc: () => {},
      fill: () => {},
      measureText: () => ({ width: 0 }),
      transform: () => {},
      rect: () => {},
      clip: () => {},
    }
  }
  
  toDataURL() {
    return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
  }
}

// Image polyfill
global.Image = class Image {
  constructor() {
    this.src = ''
    this.alt = ''
    this.onload = null
    this.onerror = null
  }
  
  set src(value) {
    this._src = value
    setTimeout(() => {
      if (this.onload) this.onload()
    }, 0)
  }
  
  get src() {
    return this._src
  }
}

// MutationObserver polyfill
global.MutationObserver = class MutationObserver {
  constructor(callback) {
    this.callback = callback
  }
  
  observe() {}
  disconnect() {}
  takeRecords() {
    return []
  }
}

// getComputedStyle polyfill
global.getComputedStyle = () => ({
  getPropertyValue: () => '',
  setProperty: () => {},
  removeProperty: () => '',
})

// requestAnimationFrame polyfill
global.requestAnimationFrame = (callback) => {
  return setTimeout(callback, 16)
}

global.cancelAnimationFrame = (id) => {
  clearTimeout(id)
}

// scrollTo polyfill
global.scrollTo = () => {}

// Element.scrollIntoView polyfill
if (typeof Element !== 'undefined') {
  Element.prototype.scrollIntoView = () => {}
} 
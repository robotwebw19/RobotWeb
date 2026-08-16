import * as monaco from 'monaco-editor'
import { loader } from '@monaco-editor/react'

// Bundle Monaco from the local npm package instead of @monaco-editor/react's
// default CDN loader, for offline/classroom reliability.
//
// No custom web worker is wired up: this editor only needs Monarch syntax
// highlighting for the Arduino C++ subset (all parsing/errors are produced by
// our own interpreter, not Monaco's language services), so the worker-backed
// features (diagnostics, formatting) are unused. Monaco falls back to running
// its default worker code on the main thread with a one-time console notice,
// which is fine at this scale.
loader.config({ monaco })

import { useMemo } from 'react'

/**
 * Tiny, dependency-free syntax highlighter. We tokenize once (useMemo) and emit
 * coloured <span>s — no `dangerouslySetInnerHTML`, no heavy highlighter lib, so
 * it stays well within the bundle budget and never blocks paint. Tuned for the
 * C-family snippets in this portfolio (JS / GLSL).
 */
const KEYWORDS = new Set(
  ('const let var function return if else for while do break continue new class ' +
    'extends import from export default void in of typeof instanceof async await ' +
    'yield this uniform varying attribute precision highp mediump lowp struct')
    .split(/\s+/),
)
const TYPES = new Set('vec2 vec3 vec4 mat2 mat3 mat4 float int bool sampler2D void'.split(/\s+/))

// one pass; every character lands in exactly one group so there are no gaps
const TOKENIZER =
  /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)|(`(?:\\.|[^`\\])*`|'(?:\\.|[^'\\])*'|"(?:\\.|[^"\\])*")|(\b\d[\w.]*\b)|([A-Za-z_]\w*)|(\s+)|([^\s\w])/g

const COLOR = {
  comment: 'text-white/35 italic',
  string: 'text-[#b6ff00]',
  number: 'text-[#f6d3b2]',
  keyword: 'text-[#caa6ff]',
  type: 'text-[#aeb9ec]',
  fn: 'text-[#bcd2ef]',
}

function tokenize(code) {
  const out = []
  let m
  TOKENIZER.lastIndex = 0
  let key = 0
  while ((m = TOKENIZER.exec(code))) {
    const [full, comment, str, num, word] = m
    let cls = null
    if (comment) cls = COLOR.comment
    else if (str) cls = COLOR.string
    else if (num) cls = COLOR.number
    else if (word) {
      if (KEYWORDS.has(word)) cls = COLOR.keyword
      else if (TYPES.has(word)) cls = COLOR.type
      else if (code[TOKENIZER.lastIndex] === '(') cls = COLOR.fn
    }
    out.push(cls ? <span key={key} className={cls}>{full}</span> : full)
    key += 1
  }
  return out
}

export default function CodeBlock({ code = '', language = '' }) {
  const tokens = useMemo(() => tokenize(code), [code])
  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-[#0e0b1c]/85 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
      <div className="flex items-center gap-2 border-b border-white/10 px-4 py-2">
        <span className="h-2.5 w-2.5 rounded-full bg-[#f2b6d4]/80" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#f6d3b2]/80" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#b6ff00]/70" />
        {language && (
          <span className="ml-auto font-body text-[11px] uppercase tracking-[0.3em] text-white/40">
            {language}
          </span>
        )}
      </div>
      <pre className="max-h-[40vh] overflow-auto px-4 py-4 text-[12.5px] leading-relaxed md:text-[13.5px]">
        <code className="whitespace-pre font-mono text-white/85">{tokens}</code>
      </pre>
    </div>
  )
}

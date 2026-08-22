import * as monaco from 'monaco-editor'

// Static suggestion catalog mirrors exactly what ArduinoRuntimeAPI, ExecutionContext, and the
// tokenizer accept — keep this in sync with those three when the language surface changes.
const { Function: Function_, Keyword, Constant, Snippet } = monaco.languages.CompletionItemKind
const AsSnippet = monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet

interface Entry {
  label: string
  kind: monaco.languages.CompletionItemKind
  insertText: string
  detail: string
  documentation: string
}

const FUNCTIONS: Entry[] = [
  {
    label: 'pinMode',
    kind: Function_,
    insertText: 'pinMode(${1:pin}, ${2:OUTPUT})',
    detail: 'pinMode(pin, mode)',
    documentation: 'ตั้งโหมดขา pin เป็น INPUT, OUTPUT หรือ INPUT_PULLUP — เรียกใน setup() ก่อนใช้ขานั้น',
  },
  {
    label: 'digitalRead',
    kind: Function_,
    insertText: 'digitalRead(${1:pin})',
    detail: 'digitalRead(pin): int',
    documentation: 'อ่านค่าดิจิทัล (HIGH/LOW) จากขาเซนเซอร์ IR ที่ต่อไว้',
  },
  {
    label: 'digitalWrite',
    kind: Function_,
    insertText: 'digitalWrite(${1:pin}, ${2:HIGH})',
    detail: 'digitalWrite(pin, value)',
    documentation: 'เขียนค่า HIGH หรือ LOW ไปที่ขา — ต้องตั้ง pinMode(pin, OUTPUT) ก่อน',
  },
  {
    label: 'analogRead',
    kind: Function_,
    insertText: 'analogRead(${1:pin})',
    detail: 'analogRead(pin): int',
    documentation: 'อ่านค่าแอนะล็อก — เซนเซอร์ IR ในโปรแกรมนี้เป็นแบบดิจิทัลเท่านั้น ใช้ digitalRead() แทน',
  },
  {
    label: 'analogWrite',
    kind: Function_,
    insertText: 'analogWrite(${1:pin}, ${2:255})',
    detail: 'analogWrite(pin, value 0-255)',
    documentation: 'สั่งค่า PWM (0-255) ไปที่ขา เช่น ขา enable ของมอเตอร์ (A0/A1) ควบคุมความเร็วมอเตอร์ — ต้องตั้ง pinMode(pin, OUTPUT) ก่อน',
  },
  {
    label: 'delay',
    kind: Function_,
    insertText: 'delay(${1:ms})',
    detail: 'delay(ms)',
    documentation: 'หยุดรอเป็นมิลลิวินาทีก่อนทำงานต่อ',
  },
  {
    label: 'delayMicroseconds',
    kind: Function_,
    insertText: 'delayMicroseconds(${1:us})',
    detail: 'delayMicroseconds(us)',
    documentation: 'หยุดรอเป็นไมโครวินาทีก่อนทำงานต่อ',
  },
  {
    label: 'pulseIn',
    kind: Function_,
    insertText: 'pulseIn(${1:pin}, ${2:HIGH})',
    detail: 'pulseIn(pin, value): long',
    documentation: 'วัดความยาวพัลส์บนขา ใช้กับ echo pin ของอัลตราโซนิก หรือ OUT pin ของเซนเซอร์สี',
  },
  {
    label: 'Serial.print',
    kind: Function_,
    insertText: 'Serial.print(${1:value})',
    detail: 'Serial.print(value)',
    documentation: 'พิมพ์ค่าออก console โดยไม่ขึ้นบรรทัดใหม่',
  },
  {
    label: 'Serial.println',
    kind: Function_,
    insertText: 'Serial.println(${1:value})',
    detail: 'Serial.println(value)',
    documentation: 'พิมพ์ค่าออก console แล้วขึ้นบรรทัดใหม่',
  },
]

const CONSTANTS: Entry[] = [
  { label: 'HIGH', kind: Constant, insertText: 'HIGH', detail: 'HIGH = 1', documentation: 'ค่าคงที่ดิจิทัลสูง' },
  { label: 'LOW', kind: Constant, insertText: 'LOW', detail: 'LOW = 0', documentation: 'ค่าคงที่ดิจิทัลต่ำ' },
  { label: 'INPUT', kind: Constant, insertText: 'INPUT', detail: 'pinMode mode', documentation: 'โหมดขาเป็นอินพุต' },
  { label: 'OUTPUT', kind: Constant, insertText: 'OUTPUT', detail: 'pinMode mode', documentation: 'โหมดขาเป็นเอาต์พุต' },
  {
    label: 'INPUT_PULLUP',
    kind: Constant,
    insertText: 'INPUT_PULLUP',
    detail: 'pinMode mode',
    documentation: 'โหมดขาเป็นอินพุตพร้อมตัวต้านทานภายในดึงขึ้น',
  },
]

const PINS: Entry[] = [
  ...['A0', 'A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7'].map(
    (pin): Entry => ({ label: pin, kind: Constant, insertText: pin, detail: 'analog pin', documentation: `ขาแอนะล็อก ${pin}` }),
  ),
  ...['D2', 'D3', 'D4', 'D5', 'D6', 'D7', 'D8', 'D9', 'D10', 'D11', 'D12', 'D13'].map(
    (pin): Entry => ({ label: pin, kind: Constant, insertText: pin, detail: 'digital pin', documentation: `ขาดิจิทัล ${pin}` }),
  ),
]

const KEYWORDS: Entry[] = ['if', 'else', 'for', 'while', 'return', 'true', 'false'].map(
  (word): Entry => ({ label: word, kind: Keyword, insertText: word, detail: 'keyword', documentation: '' }),
)

const TYPES: Entry[] = ['int', 'float', 'bool', 'string', 'void'].map(
  (word): Entry => ({ label: word, kind: Keyword, insertText: word, detail: 'type', documentation: '' }),
)

const SNIPPETS: Entry[] = [
  {
    label: 'setup',
    kind: Snippet,
    insertText: 'void setup() {\n\t$0\n}',
    detail: 'void setup() { }',
    documentation: 'ฟังก์ชันที่รันครั้งเดียวตอนเริ่มโปรแกรม เช่น ตั้ง pinMode',
  },
  {
    label: 'loop',
    kind: Snippet,
    insertText: 'void loop() {\n\t$0\n}',
    detail: 'void loop() { }',
    documentation: 'ฟังก์ชันที่วนรันซ้ำตลอดการทำงาน',
  },
  {
    label: 'if',
    kind: Snippet,
    insertText: 'if (${1:condition}) {\n\t$0\n}',
    detail: 'if (condition) { }',
    documentation: '',
  },
  {
    label: 'for',
    kind: Snippet,
    insertText: 'for (int ${1:i} = 0; $1 < ${2:count}; $1++) {\n\t$0\n}',
    detail: 'for (int i = 0; i < count; i++) { }',
    documentation: '',
  },
]

const ALL_ENTRIES = [...SNIPPETS, ...FUNCTIONS, ...CONSTANTS, ...PINS, ...KEYWORDS, ...TYPES]

/** Registers the Arduino-subset autocomplete list once, mirroring ArduinoRuntimeAPI's real function set. */
export function registerArduinoCompletions(): void {
  monaco.languages.registerCompletionItemProvider('cpp', {
    provideCompletionItems(model, position) {
      const word = model.getWordUntilPosition(position)
      const range: monaco.IRange = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: word.startColumn,
        endColumn: word.endColumn,
      }
      const suggestions: monaco.languages.CompletionItem[] = ALL_ENTRIES.map((entry) => ({
        label: entry.label,
        kind: entry.kind,
        insertText: entry.insertText,
        insertTextRules: entry.insertText.includes('${') || entry.insertText.includes('$0') ? AsSnippet : undefined,
        detail: entry.detail,
        documentation: entry.documentation || undefined,
        range,
      }))
      return { suggestions }
    },
  })
}

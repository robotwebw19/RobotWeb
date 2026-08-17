import { useState } from 'react'
import { describe, expect, it } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { DigitCodeInput } from './DigitCodeInput'

function Controlled({ length = 5 }: { length?: number }) {
  const [value, setValue] = useState('')
  return <DigitCodeInput length={length} value={value} onChange={setValue} label="student id" />
}

function cells() {
  return screen.getAllByRole('textbox') as HTMLInputElement[]
}

describe('DigitCodeInput', () => {
  it('renders one box per digit, each showing the matching character of value', () => {
    render(<DigitCodeInput length={5} value="123" onChange={() => {}} label="student id" />)
    const boxes = cells()
    expect(boxes).toHaveLength(5)
    expect(boxes.map((box) => box.value)).toEqual(['1', '2', '3', '', ''])
  })

  it('typing a digit fills the box and advances focus to the next one', () => {
    render(<Controlled />)
    const boxes = cells()
    fireEvent.change(boxes[0], { target: { value: '7' } })
    expect(cells()[0].value).toBe('7')
    expect(document.activeElement).toBe(cells()[1])
  })

  it('does not advance focus out of the last box', () => {
    render(<Controlled />)
    for (let i = 0; i < 5; i++) fireEvent.change(cells()[i], { target: { value: String(i + 1) } })
    expect(cells().map((box) => box.value)).toEqual(['1', '2', '3', '4', '5'])
    expect(document.activeElement).toBe(cells()[4])
  })

  it('backspace on a filled box clears just that box', () => {
    render(<Controlled />)
    const boxes = cells()
    fireEvent.change(boxes[0], { target: { value: '1' } })
    fireEvent.change(cells()[1], { target: { value: '2' } })
    fireEvent.keyDown(cells()[1], { key: 'Backspace' })
    expect(cells().map((box) => box.value)).toEqual(['1', '', '', '', ''])
  })

  it('backspace on an already-empty box steps back and clears the previous digit', () => {
    render(<Controlled />)
    fireEvent.change(cells()[0], { target: { value: '1' } })
    fireEvent.change(cells()[1], { target: { value: '2' } })
    // Box 2 is empty (never filled) — backspace there should clear box 1 and refocus it.
    fireEvent.keyDown(cells()[2], { key: 'Backspace' })
    expect(cells().map((box) => box.value)).toEqual(['1', '', '', '', ''])
    expect(document.activeElement).toBe(cells()[1])
  })

  it('pasting a full code distributes it across every box at once', () => {
    render(<Controlled />)
    const paste = { clipboardData: { getData: () => '98765' }, preventDefault: () => {} }
    fireEvent.paste(cells()[0], paste)
    expect(cells().map((box) => box.value)).toEqual(['9', '8', '7', '6', '5'])
  })

  it('pasting ignores non-digit characters', () => {
    render(<Controlled />)
    const paste = { clipboardData: { getData: () => 'a1-2 3b4c5' }, preventDefault: () => {} }
    fireEvent.paste(cells()[0], paste)
    expect(cells().map((box) => box.value)).toEqual(['1', '2', '3', '4', '5'])
  })

  it('arrow keys move focus between boxes without changing their value', () => {
    render(<Controlled />)
    cells()[2].focus()
    fireEvent.keyDown(cells()[2], { key: 'ArrowLeft' })
    expect(document.activeElement).toBe(cells()[1])
    fireEvent.keyDown(cells()[1], { key: 'ArrowRight' })
    expect(document.activeElement).toBe(cells()[2])
  })
})

import type { RequiredEquipmentItem } from '../../types/domain'

export const TWO_IR_AND_MOTORS: RequiredEquipmentItem[] = [
  { kind: 'sensor', type: 'ir', pin: 'A0', irMode: 'digital' },
  { kind: 'sensor', type: 'ir', pin: 'A1', irMode: 'digital' },
  { kind: 'motor', side: 'left', pin: 'M1' },
  { kind: 'motor', side: 'right', pin: 'M2' },
]

export const TWO_IR_ULTRASONIC_AND_MOTORS: RequiredEquipmentItem[] = [
  ...TWO_IR_AND_MOTORS,
  { kind: 'sensor', type: 'ultrasonic', pin: 'D7' },
]

export const TWO_IR_COLOR_AND_MOTORS: RequiredEquipmentItem[] = [
  ...TWO_IR_AND_MOTORS,
  { kind: 'sensor', type: 'color', pin: 'D8' },
]

export const ALL_EQUIPMENT: RequiredEquipmentItem[] = [
  ...TWO_IR_AND_MOTORS,
  { kind: 'sensor', type: 'ultrasonic', pin: 'D7' },
  { kind: 'sensor', type: 'color', pin: 'D8' },
]

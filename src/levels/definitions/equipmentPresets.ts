import type { RequiredEquipmentItem } from '../../types/domain'

export const TWO_IR_AND_MOTORS: RequiredEquipmentItem[] = [
  { kind: 'sensor', type: 'ir', pin: 'D2' },
  { kind: 'sensor', type: 'ir', pin: 'D3' },
  { kind: 'motor', side: 'left', in1Pin: 'D10', in2Pin: 'D11', enablePin: 'A0' },
  { kind: 'motor', side: 'right', in1Pin: 'D12', in2Pin: 'D13', enablePin: 'A1' },
]

export const TWO_IR_ULTRASONIC_AND_MOTORS: RequiredEquipmentItem[] = [
  ...TWO_IR_AND_MOTORS,
  { kind: 'sensor', type: 'ultrasonic', pin: 'D7', echoPin: 'D6' },
]

export const ALL_EQUIPMENT: RequiredEquipmentItem[] = [
  ...TWO_IR_AND_MOTORS,
  { kind: 'sensor', type: 'ultrasonic', pin: 'D7', echoPin: 'D6' },
]

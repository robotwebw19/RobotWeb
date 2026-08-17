import type { RequiredEquipmentItem } from '../../types/domain'

export const TWO_IR_AND_MOTORS: RequiredEquipmentItem[] = [
  { kind: 'sensor', type: 'ir', pin: 'D2' },
  { kind: 'sensor', type: 'ir', pin: 'D3' },
  { kind: 'motor', side: 'left', in1Pin: 'IN1', in2Pin: 'IN2', enablePin: 'ENA' },
  { kind: 'motor', side: 'right', in1Pin: 'IN3', in2Pin: 'IN4', enablePin: 'ENB' },
]

export const TWO_IR_ULTRASONIC_AND_MOTORS: RequiredEquipmentItem[] = [
  ...TWO_IR_AND_MOTORS,
  { kind: 'sensor', type: 'ultrasonic', pin: 'D7', echoPin: 'D6' },
]

export const ALL_EQUIPMENT: RequiredEquipmentItem[] = [
  ...TWO_IR_AND_MOTORS,
  { kind: 'sensor', type: 'ultrasonic', pin: 'D7', echoPin: 'D6' },
  { kind: 'sensor', type: 'color', pin: 'D8', s0Pin: 'D9', s1Pin: 'D10', s2Pin: 'D11', s3Pin: 'D12' },
]

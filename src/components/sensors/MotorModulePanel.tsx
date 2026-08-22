import motorDriverImage from '../../assets/motor-driver.png'
import { SensorModulePanel, type SensorModulePart } from './SensorModulePanel'

// Pixel coordinates of each labeled part in motor-driver.png (525x538 source), verified against
// the source photo with an overlaid coordinate grid — see conversation history. Shared by both
// the left and right motor catalog cards: the left motor wires to the left OUT terminal (OUT1/
// OUT2, ENA, IN1/IN2), the right motor to the right one (OUT3/OUT4, ENB, IN3/IN4).
const PARTS: SensorModulePart[] = [
  { x: 67, y: 353, labelKey: 'motorModule.outLeft.label', roleKey: 'motorModule.outLeft.role' },
  { x: 470, y: 353, labelKey: 'motorModule.outRight.label', roleKey: 'motorModule.outRight.role' },
  { x: 255, y: 145, labelKey: 'motorModule.ic.label', roleKey: 'motorModule.ic.role' },
  { x: 285, y: 295, labelKey: 'motorModule.caps.label', roleKey: 'motorModule.caps.role' },
  { x: 145, y: 478, labelKey: 'motorModule.vinPin.label', roleKey: 'motorModule.vinPin.role' },
  { x: 198, y: 478, labelKey: 'motorModule.gndPin.label', roleKey: 'motorModule.gndPin.role' },
  { x: 240, y: 478, labelKey: 'motorModule.vccPin.label', roleKey: 'motorModule.vccPin.role' },
  { x: 285, y: 478, labelKey: 'motorModule.ena.label', roleKey: 'motorModule.ena.role' },
  { x: 315, y: 478, labelKey: 'motorModule.in1.label', roleKey: 'motorModule.in1.role' },
  { x: 345, y: 478, labelKey: 'motorModule.in2.label', roleKey: 'motorModule.in2.role' },
  { x: 373, y: 478, labelKey: 'motorModule.in3.label', roleKey: 'motorModule.in3.role' },
  { x: 402, y: 478, labelKey: 'motorModule.in4.label', roleKey: 'motorModule.in4.role' },
  { x: 432, y: 478, labelKey: 'motorModule.enb.label', roleKey: 'motorModule.enb.role' },
]

interface MotorModulePanelProps {
  placement?: 'center' | 'right'
}

export function MotorModulePanel({ placement }: MotorModulePanelProps) {
  return (
    <SensorModulePanel
      titleKey="motorModule.title"
      image={motorDriverImage}
      imageAlt="L298N motor driver module"
      imageWidth={525}
      imageHeight={538}
      dotRadius={10}
      parts={PARTS}
      placement={placement}
    />
  )
}

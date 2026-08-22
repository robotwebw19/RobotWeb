import irSensorImage from '../../assets/ir-line-sensor.jpg'
import { SensorModulePanel, type SensorModulePart } from './SensorModulePanel'

// Pixel coordinates of each labeled part in ir-line-sensor.jpg (1920x1080 source), measured by
// eye against the board photo — mirrors the approach RobotPinoutPanel.tsx takes for the Uno art.
// Verified against the source photo crop-by-crop; see conversation history for the check.
const PARTS: SensorModulePart[] = [
  { x: 888, y: 165, labelKey: 'irModule.emitter.label', roleKey: 'irModule.emitter.role' },
  { x: 1012, y: 165, labelKey: 'irModule.receiver.label', roleKey: 'irModule.receiver.role' },
  { x: 940, y: 432, labelKey: 'irModule.resistors.label', roleKey: 'irModule.resistors.role' },
  { x: 880, y: 598, labelKey: 'irModule.comparator.label', roleKey: 'irModule.comparator.role' },
  { x: 1030, y: 590, labelKey: 'irModule.potentiometer.label', roleKey: 'irModule.potentiometer.role' },
  { x: 862, y: 765, labelKey: 'irModule.doLed.label', roleKey: 'irModule.doLed.role' },
  { x: 1050, y: 765, labelKey: 'irModule.pwrLed.label', roleKey: 'irModule.pwrLed.role' },
  { x: 888, y: 955, labelKey: 'irModule.outPin.label', roleKey: 'irModule.outPin.role' },
  { x: 940, y: 955, labelKey: 'irModule.gndPin.label', roleKey: 'irModule.gndPin.role' },
  { x: 992, y: 955, labelKey: 'irModule.vccPin.label', roleKey: 'irModule.vccPin.role' },
]

interface IrModulePanelProps {
  placement?: 'center' | 'right'
}

export function IrModulePanel({ placement }: IrModulePanelProps) {
  return (
    <SensorModulePanel
      titleKey="irModule.title"
      image={irSensorImage}
      imageAlt="IR line sensor module"
      imageWidth={1920}
      imageHeight={1080}
      dotRadius={17}
      parts={PARTS}
      placement={placement}
    />
  )
}

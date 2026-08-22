import ultrasonicSensorImage from '../../assets/ultrasonic-sensor.png'
import { SensorModulePanel, type SensorModulePart } from './SensorModulePanel'

// Pixel coordinates of each labeled part in ultrasonic-sensor.png (585x341 source), verified
// against the source photo with an overlaid coordinate grid — see conversation history.
const PARTS: SensorModulePart[] = [
  { x: 144, y: 157, labelKey: 'ultrasonicModule.transmitter.label', roleKey: 'ultrasonicModule.transmitter.role' },
  { x: 440, y: 152, labelKey: 'ultrasonicModule.receiver.label', roleKey: 'ultrasonicModule.receiver.role' },
  { x: 250, y: 230, labelKey: 'ultrasonicModule.vccPin.label', roleKey: 'ultrasonicModule.vccPin.role' },
  { x: 280, y: 230, labelKey: 'ultrasonicModule.trigPin.label', roleKey: 'ultrasonicModule.trigPin.role' },
  { x: 310, y: 230, labelKey: 'ultrasonicModule.echoPin.label', roleKey: 'ultrasonicModule.echoPin.role' },
  { x: 340, y: 230, labelKey: 'ultrasonicModule.gndPin.label', roleKey: 'ultrasonicModule.gndPin.role' },
]

export function UltrasonicModulePanel() {
  return (
    <SensorModulePanel
      titleKey="ultrasonicModule.title"
      image={ultrasonicSensorImage}
      imageAlt="HC-SR04 ultrasonic sensor module"
      imageWidth={585}
      imageHeight={341}
      dotRadius={10}
      parts={PARTS}
    />
  )
}

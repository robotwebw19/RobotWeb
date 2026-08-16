import { Circle } from 'react-konva'
import type { ColorZone, ColorZoneColor } from '../../types/domain'
import { worldToStage, defaultViewport, type Viewport } from './gridUtils'

const FILL_BY_COLOR: Record<ColorZoneColor, string> = {
  red: '#fa5252',
  green: '#40c057',
  blue: '#339af0',
  black: '#212529',
  white: '#f8f9fa',
}

interface ColorZoneLayerProps {
  colorZones: ColorZone[]
  viewport?: Viewport
}

export function ColorZoneLayer({ colorZones, viewport = defaultViewport }: ColorZoneLayerProps) {
  return (
    <>
      {colorZones.map((zone, index) => {
        const stagePos = worldToStage({ x: zone.x, y: zone.y }, viewport)
        return (
          <Circle
            key={index}
            x={stagePos.x}
            y={stagePos.y}
            radius={zone.radius * viewport.scale}
            fill={FILL_BY_COLOR[zone.color]}
            opacity={0.85}
          />
        )
      })}
    </>
  )
}

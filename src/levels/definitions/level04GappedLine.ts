import type { Level } from '../../types/domain'
import { TWO_IR_AND_MOTORS } from './equipmentPresets'

export const level04GappedLine: Level = {
  id: 'level-04-gapped-line',
  name: '4. Gapped Line',
  difficulty: 'medium',
  trackPath: [
    [
      { x: 40, y: 250 },
      { x: 220, y: 250 },
    ],
    [
      { x: 280, y: 250 },
      { x: 460, y: 250 },
    ],
    [
      { x: 520, y: 250 },
      { x: 760, y: 250 },
    ],
  ],
  obstacles: [],
  colorZones: [],
  startPosition: { x: 40, y: 250, headingDeg: 0 },
  finishZone: { x: 760, y: 250, radius: 24 },
  timeLimitMs: 25_000,
  parConditions: { threeStarTimeMs: 9000, twoStarTimeMs: 15_000, maxOffTrackEventsForThreeStars: 2 },
  requiredEquipment: TWO_IR_AND_MOTORS,
  solutionCode: `void setup() {
  pinMode(A0, INPUT); // ตั้งขา A0 (เซนเซอร์ซ้าย) เป็นอินพุต
  pinMode(A1, INPUT); // ตั้งขา A1 (เซนเซอร์ขวา) เป็นอินพุต
}

void loop() {
  int left = digitalRead(A0); // อ่านค่าเซนเซอร์ IR ฝั่งซ้าย
  int right = digitalRead(A1); // อ่านค่าเซนเซอร์ IR ฝั่งขวา

  if (left == 1 && right == 1) { // เซนเซอร์ทั้งสองเจอเส้น = อยู่กึ่งกลางเส้นพอดี
    moveForward(140); // เดินหน้าตรงด้วยความเร็วคงที่
  } else if (left == 1 && right == 0) { // มีแค่เซนเซอร์ซ้ายเจอเส้น = หลุดไปทางขวา
    turnLeft(90); // เลี้ยวซ้ายกลับเข้าหาเส้น
  } else if (left == 0 && right == 1) { // มีแค่เซนเซอร์ขวาเจอเส้น = หลุดไปทางซ้าย
    turnRight(90); // เลี้ยวขวากลับเข้าหาเส้น
  } else { // เซนเซอร์ทั้งคู่หลุดเส้น (น่าจะเจอช่องเส้นขาด)
    moveForward(140); // เดินหน้าตรงต่อไปเพื่อไถลผ่านช่องเส้นขาดจนกลับไปเจอเส้น
  }

  delay(20); // หน่วงเวลาเล็กน้อยก่อนวนลูปอ่านเซนเซอร์รอบถัดไป
}
`,
}

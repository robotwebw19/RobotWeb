import type { Level } from '../../types/domain'
import { TWO_IR_COLOR_AND_MOTORS } from './equipmentPresets'

export const level05ColorZone: Level = {
  id: 'level-05-color-zone',
  name: '5. Color Zone Response',
  difficulty: 'hard',
  trackPath: [
    [
      { x: 40, y: 250 },
      { x: 300, y: 250 },
      { x: 400, y: 120 },
      { x: 600, y: 120 },
      { x: 700, y: 250 },
      { x: 760, y: 250 },
    ],
  ],
  obstacles: [],
  colorZones: [{ x: 400, y: 120, radius: 22, color: 'red' }],
  startPosition: { x: 40, y: 250, headingDeg: 0 },
  finishZone: { x: 760, y: 250, radius: 24 },
  timeLimitMs: 26_000,
  parConditions: { threeStarTimeMs: 10_000, twoStarTimeMs: 16_000, maxOffTrackEventsForThreeStars: 1 },
  requiredEquipment: TWO_IR_COLOR_AND_MOTORS,
  solutionCode: `int stopTicks = 0; // นับจำนวนรอบที่หยุดรออยู่บนโซนสีแดงแล้ว
int baseSpeed = 150; // ความเร็วพื้นฐานของมอเตอร์ทั้งสองข้าง
int turnBoost = 120; // ค่าลดความเร็วมอเตอร์ฝั่งที่ต้องเลี้ยวเข้าหาเส้น
int lastTurn = 0; // จำทิศเลี้ยวล่าสุด (-1 ซ้าย, 1 ขวา, 0 ตรง) ไว้ใช้ตอนหลุดเส้นทั้งคู่

void setup() {
  pinMode(A0, INPUT); // ตั้งขา A0 (เซนเซอร์ซ้าย) เป็นอินพุต
  pinMode(A1, INPUT); // ตั้งขา A1 (เซนเซอร์ขวา) เป็นอินพุต
  pinMode(D8, INPUT); // ตั้งขา D8 (เซนเซอร์สี) เป็นอินพุต
}

void loop() {
  string color = readColorSensor(D8); // อ่านสีของพื้นผิวใต้เซนเซอร์สี

  if (color == "red" && stopTicks < 25) { // เจอโซนสีแดง และยังหยุดไม่ครบเวลาที่กำหนด
    stopMotors(); // หยุดมอเตอร์ทั้งสองข้างทันที
    stopTicks = stopTicks + 1; // นับรอบที่หยุดรอไปแล้ว
  } else { // ไม่ใช่โซนสีแดง หรือหยุดรอครบเวลาแล้ว เดินตามเส้นตามปกติ
    int left = digitalRead(A0); // อ่านค่าเซนเซอร์ IR ฝั่งซ้าย
    int right = digitalRead(A1); // อ่านค่าเซนเซอร์ IR ฝั่งขวา
    if (left == 1 && right == 1) { // เซนเซอร์ทั้งสองเจอเส้น = อยู่กึ่งกลางเส้นพอดี
      setMotorSpeed(baseSpeed, baseSpeed); // วิ่งตรงด้วยความเร็วเท่ากันทั้งสองล้อ
      lastTurn = 0; // รีเซ็ตทิศเลี้ยวล่าสุดเป็นตรง
    } else if (left == 1 && right == 0) { // มีแค่เซนเซอร์ซ้ายเจอเส้น = หลุดไปทางขวา
      setMotorSpeed(baseSpeed, baseSpeed - turnBoost); // ลดความเร็วล้อขวาเพื่อเลี้ยวกลับซ้าย
      lastTurn = -1; // จำว่ากำลังเลี้ยวซ้าย
    } else if (left == 0 && right == 1) { // มีแค่เซนเซอร์ขวาเจอเส้น = หลุดไปทางซ้าย
      setMotorSpeed(baseSpeed - turnBoost, baseSpeed); // ลดความเร็วล้อซ้ายเพื่อเลี้ยวกลับขวา
      lastTurn = 1; // จำว่ากำลังเลี้ยวขวา
    } else if (lastTurn < 0) { // เซนเซอร์ทั้งคู่หลุดเส้น และครั้งก่อนเลี้ยวซ้ายอยู่
      setMotorSpeed(baseSpeed, baseSpeed - turnBoost); // เลี้ยวซ้ายต่อเพื่อหาเส้นกลับมา
    } else if (lastTurn > 0) { // เซนเซอร์ทั้งคู่หลุดเส้น และครั้งก่อนเลี้ยวขวาอยู่
      setMotorSpeed(baseSpeed - turnBoost, baseSpeed); // เลี้ยวขวาต่อเพื่อหาเส้นกลับมา
    } else { // หลุดเส้นทั้งคู่โดยไม่มีประวัติเลี้ยวมาก่อน
      setMotorSpeed(baseSpeed, baseSpeed); // วิ่งตรงไปก่อนเผื่อกลับมาเจอเส้น
    }
  }

  delay(20); // หน่วงเวลาเล็กน้อยก่อนวนลูปอ่านเซนเซอร์รอบถัดไป
}
`,
}

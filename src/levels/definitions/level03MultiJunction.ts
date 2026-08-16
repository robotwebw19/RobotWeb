import type { Level } from '../../types/domain'
import { TWO_IR_AND_MOTORS } from './equipmentPresets'

export const level03MultiJunction: Level = {
  id: 'level-03-multi-junction',
  name: '3. Multi-Way Junction',
  difficulty: 'medium',
  trackPath: [
    [
      { x: 40, y: 250 },
      { x: 380, y: 250 },
    ],
    [
      { x: 380, y: 250 },
      { x: 380, y: 80 },
    ], // branch A: up, decoy
    [
      { x: 380, y: 250 },
      { x: 600, y: 400 },
    ], // branch B: down-right, correct
    [
      { x: 380, y: 250 },
      { x: 200, y: 420 },
    ], // branch C: down-left, decoy
  ],
  obstacles: [],
  colorZones: [],
  startPosition: { x: 40, y: 250, headingDeg: 0 },
  finishZone: { x: 600, y: 400, radius: 24 },
  timeLimitMs: 22_000,
  parConditions: { threeStarTimeMs: 8500, twoStarTimeMs: 14_000, maxOffTrackEventsForThreeStars: 1 },
  requiredEquipment: TWO_IR_AND_MOTORS,
  solutionCode: `bool pivoting = false; // สถานะกำลังหมุนตัวหาเส้นที่ทางแยกอยู่หรือไม่
bool pastJunction = false; // เคยผ่านทางแยกไปแล้วหรือยัง (กันไม่ให้หมุนซ้ำ)
int baseSpeed = 150; // ความเร็วพื้นฐานของมอเตอร์ทั้งสองข้าง
int turnBoost = 90; // ค่าลดความเร็วมอเตอร์ฝั่งที่ต้องเลี้ยวเข้าหาเส้น
int lastTurn = 0; // จำทิศเลี้ยวล่าสุด (-1 ซ้าย, 1 ขวา, 0 ตรง) ไว้ใช้ตอนหลุดเส้นทั้งคู่
int turnTicks = 0; // นับจำนวนรอบลูปที่หมุนตัวอยู่ระหว่างการหาเส้นที่ทางแยก

void setup() {
  pinMode(A0, INPUT); // ตั้งขา A0 (เซนเซอร์ซ้าย) เป็นอินพุต
  pinMode(A1, INPUT); // ตั้งขา A1 (เซนเซอร์ขวา) เป็นอินพุต
}

void loop() {
  int left = digitalRead(A0); // อ่านค่าเซนเซอร์ IR ฝั่งซ้าย
  int right = digitalRead(A1); // อ่านค่าเซนเซอร์ IR ฝั่งขวา

  if (pivoting) { // กำลังอยู่ในโหมดหมุนตัวหาเส้นที่ทางแยก (มีหลายแขนงให้เลือก)
    turnRight(100); // หมุนตัวไปทางขวาไล่หาแขนงเส้นที่ถูกต้อง
    turnTicks = turnTicks + 1; // นับรอบที่หมุนไปแล้ว
    if (turnTicks > 15 && (left == 1 || right == 1)) { // หมุนพอสมควรแล้วและเจอเส้นแล้ว
      pivoting = false; // เลิกโหมดหมุนตัว
      pastJunction = true; // ถือว่าผ่านทางแยกไปแล้ว
      lastTurn = 0; // รีเซ็ตทิศเลี้ยวล่าสุด
    }
  } else if (!pastJunction && left == 0 && right == 0) { // ยังไม่ผ่านทางแยก และเซนเซอร์หลุดเส้นทั้งคู่ = ถึงทางแยกแล้ว
    pivoting = true; // เริ่มโหมดหมุนตัวหาเส้นที่ทางแยก
    turnTicks = 0; // รีเซ็ตตัวนับรอบหมุน
  } else if (left == 1 && right == 1) { // เซนเซอร์ทั้งสองเจอเส้น = อยู่กึ่งกลางเส้นพอดี
    setMotorSpeed(baseSpeed, baseSpeed); // วิ่งตรงด้วยความเร็วเท่ากันทั้งสองล้อ
    lastTurn = 0; // รีเซ็ตทิศเลี้ยวล่าสุดเป็นตรง
  } else if (left == 1 && right == 0) { // มีแค่เซนเซอร์ซ้ายเจอเส้น = หลุดไปทางขวา
    setMotorSpeed(baseSpeed, baseSpeed - turnBoost); // ลดความเร็วล้อขวาเพื่อเลี้ยวกลับซ้าย
    lastTurn = -1; // จำว่ากำลังเลี้ยวซ้าย
    pastJunction = true; // ถือว่าผ่านทางแยกแล้วเพราะเจอเส้นข้างเดียว
  } else if (left == 0 && right == 1) { // มีแค่เซนเซอร์ขวาเจอเส้น = หลุดไปทางซ้าย
    setMotorSpeed(baseSpeed - turnBoost, baseSpeed); // ลดความเร็วล้อซ้ายเพื่อเลี้ยวกลับขวา
    lastTurn = 1; // จำว่ากำลังเลี้ยวขวา
    pastJunction = true; // ถือว่าผ่านทางแยกแล้วเพราะเจอเส้นข้างเดียว
  } else if (lastTurn < 0) { // เซนเซอร์ทั้งคู่หลุดเส้น และครั้งก่อนเลี้ยวซ้ายอยู่
    setMotorSpeed(baseSpeed, baseSpeed - turnBoost); // เลี้ยวซ้ายต่อเพื่อหาเส้นกลับมา
  } else if (lastTurn > 0) { // เซนเซอร์ทั้งคู่หลุดเส้น และครั้งก่อนเลี้ยวขวาอยู่
    setMotorSpeed(baseSpeed - turnBoost, baseSpeed); // เลี้ยวขวาต่อเพื่อหาเส้นกลับมา
  } else { // หลุดเส้นทั้งคู่โดยไม่มีประวัติเลี้ยวมาก่อน
    setMotorSpeed(baseSpeed, baseSpeed); // วิ่งตรงไปก่อนเผื่อกลับมาเจอเส้น
  }

  delay(20); // หน่วงเวลาเล็กน้อยก่อนวนลูปอ่านเซนเซอร์รอบถัดไป
}
`,
}

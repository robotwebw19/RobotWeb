import type { Level } from '../../types/domain'
import { TWO_IR_AND_MOTORS } from './equipmentPresets'

export const level01Straight: Level = {
  id: 'level-01-straight',
  name: '1. Straight Line',
  difficulty: 'beginner',
  trackPath: [
    [
      { x: 40, y: 250 },
      { x: 760, y: 250 },
    ],
  ],
  obstacles: [],
  colorZones: [],
  startPosition: { x: 40, y: 250, headingDeg: 0 },
  finishZone: { x: 760, y: 250, radius: 24 },
  timeLimitMs: 20_000,
  parConditions: { threeStarTimeMs: 6000, twoStarTimeMs: 10_000, maxOffTrackEventsForThreeStars: 0 },
  requiredEquipment: TWO_IR_AND_MOTORS,
  solutionCode: `int baseSpeed = 150; // ความเร็วพื้นฐานของมอเตอร์ทั้งสองข้าง
int turnBoost = 90; // ค่าลดความเร็วมอเตอร์ฝั่งที่ต้องเลี้ยวเข้าหาเส้น
int lastTurn = 0; // จำทิศเลี้ยวล่าสุด (-1 ซ้าย, 1 ขวา, 0 ตรง) ไว้ใช้ตอนหลุดเส้นทั้งคู่
int leftSpeed = 0; // ความเร็วที่ต้องการของล้อซ้าย (ลบ = ถอยหลัง)
int rightSpeed = 0; // ความเร็วที่ต้องการของล้อขวา

void setup() {
  pinMode(D2, INPUT); // ตั้งขา D2 (เซนเซอร์ซ้าย) เป็นอินพุต
  pinMode(D3, INPUT); // ตั้งขา D3 (เซนเซอร์ขวา) เป็นอินพุต
  pinMode(D10, OUTPUT); // ขาเลือกทิศมอเตอร์ซ้าย (L298N)
  pinMode(D11, OUTPUT);
  pinMode(A0, OUTPUT); // ขา PWM ความเร็วมอเตอร์ซ้าย
  pinMode(D12, OUTPUT); // ขาเลือกทิศมอเตอร์ขวา
  pinMode(D13, OUTPUT);
  pinMode(A1, OUTPUT); // ขา PWM ความเร็วมอเตอร์ขวา
}

// สั่งขา D10/D11/A0 และ D12/D13/A1 จริงตาม leftSpeed/rightSpeed ที่ตั้งไว้
void applyMotorSpeeds() {
  if (leftSpeed > 0) {
    digitalWrite(D10, HIGH);
    digitalWrite(D11, LOW);
    analogWrite(A0, leftSpeed);
  } else if (leftSpeed < 0) {
    digitalWrite(D10, LOW);
    digitalWrite(D11, HIGH);
    analogWrite(A0, -leftSpeed);
  } else {
    digitalWrite(D10, LOW);
    digitalWrite(D11, LOW);
    analogWrite(A0, 0);
  }

  if (rightSpeed > 0) {
    digitalWrite(D12, HIGH);
    digitalWrite(D13, LOW);
    analogWrite(A1, rightSpeed);
  } else if (rightSpeed < 0) {
    digitalWrite(D12, LOW);
    digitalWrite(D13, HIGH);
    analogWrite(A1, -rightSpeed);
  } else {
    digitalWrite(D12, LOW);
    digitalWrite(D13, LOW);
    analogWrite(A1, 0);
  }
}

void loop() {
  int left = digitalRead(D2); // อ่านค่าเซนเซอร์ IR ฝั่งซ้าย
  int right = digitalRead(D3); // อ่านค่าเซนเซอร์ IR ฝั่งขวา

  if (left == 1 && right == 1) { // เซนเซอร์ทั้งสองเจอเส้น = อยู่กึ่งกลางเส้นพอดี
    leftSpeed = baseSpeed; // วิ่งตรงด้วยความเร็วเท่ากันทั้งสองล้อ
    rightSpeed = baseSpeed;
    lastTurn = 0; // รีเซ็ตทิศเลี้ยวล่าสุดเป็นตรง
  } else if (left == 1 && right == 0) { // มีแค่เซนเซอร์ซ้ายเจอเส้น = หลุดไปทางขวา
    leftSpeed = baseSpeed; // ลดความเร็วล้อขวาเพื่อเลี้ยวกลับซ้าย
    rightSpeed = baseSpeed - turnBoost;
    lastTurn = -1; // จำว่ากำลังเลี้ยวซ้าย
  } else if (left == 0 && right == 1) { // มีแค่เซนเซอร์ขวาเจอเส้น = หลุดไปทางซ้าย
    leftSpeed = baseSpeed - turnBoost; // ลดความเร็วล้อซ้ายเพื่อเลี้ยวกลับขวา
    rightSpeed = baseSpeed;
    lastTurn = 1; // จำว่ากำลังเลี้ยวขวา
  } else if (lastTurn < 0) { // เซนเซอร์ทั้งคู่หลุดเส้น และครั้งก่อนเลี้ยวซ้ายอยู่
    leftSpeed = baseSpeed; // เลี้ยวซ้ายต่อเพื่อหาเส้นกลับมา
    rightSpeed = baseSpeed - turnBoost;
  } else if (lastTurn > 0) { // เซนเซอร์ทั้งคู่หลุดเส้น และครั้งก่อนเลี้ยวขวาอยู่
    leftSpeed = baseSpeed - turnBoost; // เลี้ยวขวาต่อเพื่อหาเส้นกลับมา
    rightSpeed = baseSpeed;
  } else { // หลุดเส้นทั้งคู่โดยไม่มีประวัติเลี้ยวมาก่อน
    leftSpeed = baseSpeed; // วิ่งตรงไปก่อนเผื่อกลับมาเจอเส้น
    rightSpeed = baseSpeed;
  }
  applyMotorSpeeds();

  delay(20); // หน่วงเวลาเล็กน้อยก่อนวนลูปอ่านเซนเซอร์รอบถัดไป
}
`,
}

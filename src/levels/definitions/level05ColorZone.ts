import type { Level } from '../../types/domain'
import { TWO_IR_AND_MOTORS } from './equipmentPresets'

// Circular track, radius 160 centered at (400,250), sampled every 10°. Points with y >= 250
// (the bottom half) fall past lineInversionBoundaryY below — real ground/line colors swap there.
export const level05ColorZone: Level = {
  id: 'level-05-color-zone',
  name: '5. Inverted Circle',
  difficulty: 'hard',
  trackPath: [
    [
      { x: 400, y: 90 },
      { x: 427.8, y: 92.4 },
      { x: 454.7, y: 99.6 },
      { x: 480, y: 111.4 },
      { x: 502.8, y: 127.4 },
      { x: 522.6, y: 147.2 },
      { x: 538.6, y: 170 },
      { x: 550.4, y: 195.3 },
      { x: 557.6, y: 222.2 },
      { x: 560, y: 250 },
      { x: 557.6, y: 277.8 },
      { x: 550.4, y: 304.7 },
      { x: 538.6, y: 330 },
      { x: 522.6, y: 352.8 },
      { x: 502.8, y: 372.6 },
      { x: 480, y: 388.6 },
      { x: 454.7, y: 400.4 },
      { x: 427.8, y: 407.6 },
      { x: 400, y: 410 },
      { x: 372.2, y: 407.6 },
      { x: 345.3, y: 400.4 },
      { x: 320, y: 388.6 },
      { x: 297.2, y: 372.6 },
      { x: 277.4, y: 352.8 },
      { x: 261.4, y: 330 },
      { x: 249.6, y: 304.7 },
      { x: 242.4, y: 277.8 },
      { x: 240, y: 250 },
      { x: 242.4, y: 222.2 },
      { x: 249.6, y: 195.3 },
      { x: 261.4, y: 170 },
      { x: 277.4, y: 147.2 },
      { x: 297.2, y: 127.4 },
      { x: 320, y: 111.4 },
      { x: 345.3, y: 99.6 },
      { x: 372.2, y: 92.4 },
      { x: 400, y: 90 },
    ],
  ],
  obstacles: [],
  colorZones: [],
  startPosition: { x: 400, y: 90, headingDeg: 0 },
  finishZone: { x: 400, y: 410, radius: 24 },
  lineInversionBoundaryY: 250,
  timeLimitMs: 22_000,
  parConditions: { threeStarTimeMs: 8000, twoStarTimeMs: 13_000, maxOffTrackEventsForThreeStars: 1 },
  requiredEquipment: TWO_IR_AND_MOTORS,
  solutionCode: `int baseSpeed = 150; // ความเร็วพื้นฐานของมอเตอร์ทั้งสองข้าง
int turnBoost = 100; // ค่าลดความเร็วมอเตอร์ฝั่งที่ต้องเลี้ยวเข้าหาเส้น
int lastTurn = 0; // จำทิศเลี้ยวล่าสุด (-1 ซ้าย, 1 ขวา, 0 ตรง) ไว้ใช้ตอนหลุดเส้นทั้งคู่
int onLineBit = 1; // ค่า digitalRead ที่แปลว่า "อยู่บนเส้น" ตอนนี้ — เริ่มที่ 1 (ครึ่งบน: เส้นดำพื้นขาว)
int leftSpeed = 0; // ความเร็วที่ต้องการของล้อซ้าย (ลบ = ถอยหลัง)
int rightSpeed = 0; // ความเร็วที่ต้องการของล้อขวา

void setup() {
  pinMode(D2, INPUT); // ตั้งขา D2 (เซนเซอร์ซ้าย) เป็นอินพุต
  pinMode(D3, INPUT); // ตั้งขา D3 (เซนเซอร์ขวา) เป็นอินพุต
  pinMode(IN1, OUTPUT); // ขาเลือกทิศมอเตอร์ซ้าย (L298N)
  pinMode(IN2, OUTPUT);
  pinMode(ENA, OUTPUT); // ขา PWM ความเร็วมอเตอร์ซ้าย
  pinMode(IN3, OUTPUT); // ขาเลือกทิศมอเตอร์ขวา
  pinMode(IN4, OUTPUT);
  pinMode(ENB, OUTPUT); // ขา PWM ความเร็วมอเตอร์ขวา
}

// สั่งขา IN1/IN2/ENA และ IN3/IN4/ENB จริงตาม leftSpeed/rightSpeed ที่ตั้งไว้
void applyMotorSpeeds() {
  if (leftSpeed > 0) {
    digitalWrite(IN1, HIGH);
    digitalWrite(IN2, LOW);
    analogWrite(ENA, leftSpeed);
  } else if (leftSpeed < 0) {
    digitalWrite(IN1, LOW);
    digitalWrite(IN2, HIGH);
    analogWrite(ENA, -leftSpeed);
  } else {
    digitalWrite(IN1, LOW);
    digitalWrite(IN2, LOW);
    analogWrite(ENA, 0);
  }

  if (rightSpeed > 0) {
    digitalWrite(IN3, HIGH);
    digitalWrite(IN4, LOW);
    analogWrite(ENB, rightSpeed);
  } else if (rightSpeed < 0) {
    digitalWrite(IN3, LOW);
    digitalWrite(IN4, HIGH);
    analogWrite(ENB, -rightSpeed);
  } else {
    digitalWrite(IN3, LOW);
    digitalWrite(IN4, LOW);
    analogWrite(ENB, 0);
  }
}

void loop() {
  int rawLeft = digitalRead(D2); // ค่าดิบจากเซนเซอร์ซ้าย (ความหมายกลับด้านได้ถ้าข้ามครึ่งวงกลม)
  int rawRight = digitalRead(D3); // ค่าดิบจากเซนเซอร์ขวา

  // เซนเซอร์เป็นตัวเปรียบเทียบสว่าง/มืดแบบมีเกณฑ์คงที่ ไม่ได้รู้ว่า "เส้น" คืออะไร — ถ้าสีเส้น/พื้น
  // สลับกัน ค่าที่แปลว่า "อยู่บนเส้น" ก็สลับตามไปด้วย ตรวจจับตอนข้ามจุดสลับสี: เซนเซอร์ทั้งสองอ่านค่า
  // เท่ากัน แต่ตรงข้ามกับความหมายเดิม แปลว่าเพิ่งข้ามเข้าครึ่งวงกลมที่กลับสีแล้ว
  if (rawLeft == rawRight && rawLeft != onLineBit) {
    onLineBit = rawLeft;
  }

  int left = 0; // แปลงค่าดิบให้เป็นความหมายมาตรฐาน: 1 = อยู่บนเส้นเสมอ ไม่ว่าจะอยู่ครึ่งไหน
  if (rawLeft == onLineBit) {
    left = 1;
  }
  int right = 0;
  if (rawRight == onLineBit) {
    right = 1;
  }

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

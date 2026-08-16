type Entry = Record<'en' | 'th', string>

export const translations = {
  // Navbar
  'nav.brand': { en: 'URRWNM Line Tracking Robot', th: 'URRWNM Line Tracking Robot' },
  'nav.leaderboard': { en: 'Leaderboard', th: 'กระดานผู้นำ' },
  'nav.profile': { en: 'Profile', th: 'โปรไฟล์' },
  'nav.logout': { en: 'Log out', th: 'ออกจากระบบ' },
  'nav.notSignedIn': { en: 'Not signed in', th: 'ยังไม่ได้เข้าสู่ระบบ' },
  'nav.admin': { en: 'Admin', th: 'แอดมิน' },

  // Login
  'login.title': { en: 'URRWNM Line Tracking Robot', th: 'URRWNM Line Tracking Robot' },
  'login.subtitle': { en: 'Enter your 5-digit student ID to continue', th: 'กรอกรหัสนักเรียน 5 หลักเพื่อดำเนินการต่อ' },
  'login.idLabel': { en: '5-digit student ID', th: 'รหัสนักเรียน 5 หลัก' },
  'login.continue': { en: 'Continue', th: 'ดำเนินการต่อ' },
  'login.adminLogin': { en: 'Admin login', th: 'เข้าสู่ระบบแอดมิน' },
  'login.backToStudent': { en: 'Back to student login', th: 'กลับไปเข้าสู่ระบบนักเรียน' },
  'login.adminUsernameLabel': { en: 'Admin username', th: 'ชื่อผู้ใช้แอดมิน' },
  'login.adminError': { en: 'Invalid admin code.', th: 'รหัสแอดมินไม่ถูกต้อง' },

  // Onboarding
  'onboarding.welcome': { en: 'Welcome!', th: 'ยินดีต้อนรับ!' },
  'onboarding.newIdSubtitle': {
    en: 'Student ID {id} is new — pick a display name.',
    th: 'รหัสนักเรียน {id} เป็นรหัสใหม่ — เลือกชื่อที่ใช้แสดง',
  },
  'onboarding.displayNamePlaceholder': { en: 'Display name', th: 'ชื่อที่ใช้แสดง' },
  'onboarding.nextButton': { en: 'Next: build your robot', th: 'ถัดไป: สร้างหุ่นยนต์ของคุณ' },
  'onboarding.buildRobotTitle': { en: 'Build your robot', th: 'สร้างหุ่นยนต์ของคุณ' },
  'onboarding.buildRobotSubtitle': {
    en: 'Choose sensors and pin placements before your first run.',
    th: 'เลือกเซนเซอร์และตำแหน่งพินก่อนรันครั้งแรก',
  },
  'onboarding.startPlaying': { en: 'Start playing', th: 'เริ่มเล่น' },

  // Sensor configurator
  'sensors.robotNamePlaceholder': { en: 'Robot name', th: 'ชื่อหุ่นยนต์' },
  'sensors.applyRow': { en: 'Apply {count}-sensor row', th: 'ใช้แถวเซนเซอร์ {count} ตัว' },
  'sensors.digitalMode': { en: 'Digital (0/1)', th: 'ดิจิทัล (0/1)' },
  'sensors.analogMode': { en: 'Analog (0-1023)', th: 'อนาล็อก (0-1023)' },
  'sensors.mounted': { en: 'Mounted', th: 'ติดตั้งแล้ว' },
  'sensors.irModeLabel': { en: 'IR sensor mode', th: 'โหมดเซนเซอร์อินฟราเรด' },
  'sensors.add': { en: 'Add', th: 'เพิ่ม' },
  'sensors.noneMounted': { en: 'No sensors mounted yet.', th: 'ยังไม่ได้ติดตั้งเซนเซอร์' },
  'sensors.remove': { en: 'Remove', th: 'ลบ' },
  'sensors.saveRobot': { en: 'Save robot', th: 'บันทึกหุ่นยนต์' },
  'sensors.saveChanges': { en: 'Save changes', th: 'บันทึกการเปลี่ยนแปลง' },
  'sensors.pin': { en: 'Pin', th: 'พิน' },
  'sensors.placementPreview': { en: 'Sensor placement preview', th: 'ตัวอย่างตำแหน่งเซนเซอร์' },
  'sensors.robotNameDefault': { en: 'My Robot', th: 'หุ่นยนต์ของฉัน' },
  'validation.duplicatePin': {
    en: 'Pin {pin} is assigned to more than one sensor.',
    th: 'พิน {pin} ถูกใช้ซ้ำโดยหลายเซนเซอร์',
  },
  'validation.noSensors': { en: 'Add at least one sensor before saving.', th: 'เพิ่มเซนเซอร์อย่างน้อย 1 ตัวก่อนบันทึก' },
  'validation.missingMotors': {
    en: 'Add both the left and right motor before saving.',
    th: 'เพิ่มมอเตอร์ทั้งซ้ายและขวาก่อนบันทึก',
  },

  // Sensor catalog
  'catalog.ir.label': { en: 'IR Line', th: 'อินฟราเรดตรวจจับเส้น' },
  'catalog.ir.description': {
    en: 'Detects reflectance under the robot to follow a line. Mounted as an evenly-spaced row.',
    th: 'ตรวจจับการสะท้อนแสงใต้ตัวหุ่นยนต์เพื่อเดินตามเส้น ติดตั้งเป็นแถวเว้นระยะเท่ากัน',
  },
  'catalog.ultrasonic.label': { en: 'Ultrasonic', th: 'อัลตราโซนิก' },
  'catalog.ultrasonic.description': {
    en: 'Measures distance to the nearest obstacle ahead, in cm.',
    th: 'วัดระยะห่างจากสิ่งกีดขวางที่ใกล้ที่สุดด้านหน้า หน่วยเซนติเมตร',
  },
  'catalog.color.label': { en: 'Color', th: 'ตรวจจับสี' },
  'catalog.color.description': {
    en: 'Reads the color of the floor beneath the robot.',
    th: 'อ่านค่าสีของพื้นใต้ตัวหุ่นยนต์',
  },
  'catalog.motor.left.label': { en: 'Left Motor', th: 'มอเตอร์ซ้าย' },
  'catalog.motor.right.label': { en: 'Right Motor', th: 'มอเตอร์ขวา' },
  'catalog.motor.description': {
    en: 'Drives one wheel. Both motors are required to move the robot.',
    th: 'ขับเคลื่อนล้อหนึ่งข้าง ต้องมีมอเตอร์ทั้งสองข้างจึงจะขับหุ่นยนต์ได้',
  },

  // Left panel tabs
  'leftPanel.levels': { en: 'Levels', th: 'ด่าน' },
  'leftPanel.sensors': { en: 'Sensors', th: 'เซนเซอร์' },
  'leftPanel.editor': { en: 'Level Editor', th: 'สร้างด่าน' },

  // Level list/card
  'level.notCompleted': { en: 'Not completed yet', th: 'ยังไม่ผ่านด่านนี้' },
  'difficulty.beginner': { en: 'beginner', th: 'เริ่มต้น' },
  'difficulty.easy': { en: 'easy', th: 'ง่าย' },
  'difficulty.medium': { en: 'medium', th: 'ปานกลาง' },
  'difficulty.hard': { en: 'hard', th: 'ยาก' },
  'difficulty.expert': { en: 'expert', th: 'ผู้เชี่ยวชาญ' },

  // Level editor
  'editor.levelNamePlaceholder': { en: 'Level name', th: 'ชื่อด่าน' },
  'editor.tool.brush': { en: 'Brush', th: 'พู่กัน' },
  'editor.tool.eraser': { en: 'Eraser', th: 'ยางลบ' },
  'editor.tool.line': { en: 'Line', th: 'เส้นตรง' },
  'editor.tool.curve': { en: 'Curve', th: 'เส้นโค้ง' },
  'editor.tool.obstacle': { en: 'Obstacle', th: 'สิ่งกีดขวาง' },
  'editor.tool.colorZone': { en: 'Color zone', th: 'จุดสี' },
  'editor.tool.start': { en: 'Start', th: 'จุดเริ่ม' },
  'editor.tool.finish': { en: 'Finish', th: 'จุดจบ' },
  'editor.useColor': { en: 'Use {color}', th: 'ใช้สี {color}' },
  'editor.clearTrack': { en: 'Clear track', th: 'ล้างเส้นทาง' },
  'editor.exportJson': { en: 'Export JSON', th: 'ส่งออก JSON' },
  'editor.importJson': { en: 'Import JSON', th: 'นำเข้า JSON' },
  'editor.saveAndTest': { en: 'Save & Test Now', th: 'บันทึกและทดสอบทันที' },
  'editor.importInvalidJson': { en: 'That file is not valid JSON.', th: 'ไฟล์นี้ไม่ใช่ JSON ที่ถูกต้อง' },
  'editor.importNotALevel': {
    en: 'That JSON does not look like a level file (missing or malformed fields).',
    th: 'JSON นี้ไม่ใช่ไฟล์ด่าน (มีข้อมูลขาดหายหรือไม่ถูกต้อง)',
  },
  'editor.importGenericError': { en: 'Could not import that file.', th: 'ไม่สามารถนำเข้าไฟล์นี้ได้' },

  // Center panel / run controls
  'center.runHint': {
    en: 'Run parses your code first — the robot only moves if it compiles cleanly.',
    th: 'กด Run จะตรวจโค้ดก่อนเสมอ หุ่นยนต์จะขยับก็ต่อเมื่อโค้ดไม่มีข้อผิดพลาด',
  },
  'run.run': { en: 'Run', th: 'รัน' },
  'run.resume': { en: 'Resume', th: 'ทำต่อ' },
  'run.pause': { en: 'Pause', th: 'หยุดชั่วคราว' },
  'run.reset': { en: 'Reset', th: 'รีเซ็ต' },

  // HUD
  'hud.status': { en: 'Status', th: 'สถานะ' },
  'hud.elapsed': { en: 'Elapsed', th: 'เวลาที่ใช้' },
  'hud.motors': { en: 'Motors: L {left} / R {right}', th: 'มอเตอร์: ซ้าย {left} / ขวา {right}' },
  'hud.offTrack': { en: 'Off-track', th: 'หลุดเส้น' },
  'hud.collision': { en: 'Collision', th: 'ชนสิ่งกีดขวาง' },
  'status.idle': { en: 'idle', th: 'ยังไม่เริ่ม' },
  'status.running': { en: 'running', th: 'กำลังทำงาน' },
  'status.paused': { en: 'paused', th: 'หยุดชั่วคราว' },
  'status.passed': { en: 'passed', th: 'ผ่านแล้ว' },
  'status.failed': { en: 'failed', th: 'ไม่ผ่าน' },

  // Right panel / code editor
  'console.empty': { en: 'Console output will appear here.', th: 'ผลลัพธ์คอนโซลจะแสดงที่นี่' },
  'console.syntaxError': { en: 'Syntax error (line {line})', th: 'ข้อผิดพลาดทางไวยากรณ์ (บรรทัด {line})' },
  'console.runtimeError': { en: 'Runtime error (line {line})', th: 'ข้อผิดพลาดขณะทำงาน (บรรทัด {line})' },
  'console.error': { en: 'Error', th: 'ข้อผิดพลาด' },

  // Level result modal
  'result.complete': { en: 'Level complete!', th: 'ผ่านด่านแล้ว!' },
  'result.failed': { en: 'Level failed', th: 'ไม่ผ่านด่าน' },
  'result.time': { en: 'Time: {time}s', th: 'เวลา: {time} วินาที' },
  'result.timeLabel': { en: 'Time', th: 'เวลา' },
  'result.tryAgain': { en: 'Try again', th: 'ลองอีกครั้ง' },
  'result.reason.off-track': { en: 'Off the line too long.', th: 'หลุดออกจากเส้นนานเกินไป' },
  'result.reason.collision': { en: 'Crashed into an obstacle.', th: 'ชนสิ่งกีดขวาง' },
  'result.reason.timeout': { en: 'Ran out of time.', th: 'หมดเวลา' },

  // Leaderboard
  'leaderboard.levelTitle': { en: 'Level Leaderboard', th: 'อันดับประจำด่าน' },
  'leaderboard.globalTitle': { en: 'Global Leaderboard', th: 'อันดับรวมทุกด่าน' },
  'leaderboard.levelEmpty': {
    en: 'No one has completed this level yet — be the first!',
    th: 'ยังไม่มีใครผ่านด่านนี้ — เป็นคนแรกเลย!',
  },
  'leaderboard.globalEmpty': { en: 'No completed levels yet.', th: 'ยังไม่มีด่านที่ผ่าน' },
  'leaderboard.rank': { en: '#', th: 'อันดับ' },
  'leaderboard.player': { en: 'Player', th: 'ผู้เล่น' },
  'leaderboard.time': { en: 'Time', th: 'เวลา' },
  'leaderboard.stars': { en: 'Stars', th: 'ดาว' },
  'leaderboard.date': { en: 'Date', th: 'วันที่' },
  'leaderboard.totalStars': { en: 'Total stars', th: 'ดาวรวม' },
  'leaderboard.levelsPassed': { en: 'Levels passed', th: 'ด่านที่ผ่าน' },

  // Profile
  'profile.robotSummary': { en: '{robotName} · {count} sensor(s)', th: '{robotName} · เซนเซอร์ {count} ตัว' },
  'profile.levelsPassed': { en: 'Levels passed', th: 'ด่านที่ผ่าน' },
  'profile.totalStars': { en: 'Total stars', th: 'ดาวรวม' },
  'profile.level': { en: 'Level', th: 'ด่าน' },
  'profile.bestTime': { en: 'Best time', th: 'เวลาดีที่สุด' },

  // Admin
  'admin.title': { en: 'Admin Dashboard', th: 'แผงควบคุมแอดมิน' },
  'admin.tabLevels': { en: 'Levels & Solutions', th: 'ด่านและเฉลย' },
  'admin.tabStudents': { en: 'Students', th: 'นักเรียน' },
  'admin.solutionCode': { en: 'Solution code', th: 'โค้ดเฉลย' },
  'admin.requiredEquipment': { en: 'Required equipment', th: 'อุปกรณ์ที่ต้องใช้' },
  'admin.noEquipment': { en: 'No equipment list for this level.', th: 'ด่านนี้ยังไม่มีรายการอุปกรณ์' },
  'admin.noSolution': { en: 'No solution code for this level.', th: 'ด่านนี้ยังไม่มีโค้ดเฉลย' },
  'admin.builtIn': { en: 'Built-in level', th: 'ด่านสำเร็จรูป' },
  'admin.userCreated': { en: 'User-created', th: 'สร้างโดยผู้เล่น' },
  'admin.deleteLevel': { en: 'Delete level', th: 'ลบด่าน' },
  'admin.deleteStudent': { en: 'Delete student', th: 'ลบนักเรียน' },
  'admin.confirmDeleteLevel': { en: 'Delete this level? This cannot be undone.', th: 'ลบด่านนี้หรือไม่? ไม่สามารถย้อนกลับได้' },
  'admin.confirmDeleteStudent': {
    en: 'Delete this student’s account? This cannot be undone.',
    th: 'ลบบัญชีนักเรียนคนนี้หรือไม่? ไม่สามารถย้อนกลับได้',
  },
  'admin.studentId': { en: 'Student ID', th: 'รหัสนักเรียน' },
  'admin.displayName': { en: 'Name', th: 'ชื่อ' },
  'admin.robot': { en: 'Robot', th: 'หุ่นยนต์' },
  'admin.noStudents': { en: 'No students have signed in yet.', th: 'ยังไม่มีนักเรียนเข้าสู่ระบบ' },

  // Seed level names (user-created levels fall back to their own stored name — see getLevelName)
  'level.level-01-straight.name': { en: '1. Straight Line', th: '1. เส้นตรง' },
  'level.level-02-curve.name': { en: '2. Curved Line', th: '2. เส้นโค้ง' },
  'level.level-03-multi-junction.name': { en: '3. Multi-Way Junction', th: '3. ทางแยกหลายทาง' },
  'level.level-04-gapped-line.name': { en: '4. Gapped Line', th: '4. เส้นขาดช่วง' },
  'level.level-05-color-zone.name': { en: '5. Color Zone Response', th: '5. ตอบสนองจุดสี' },

  // Common
} satisfies Record<string, Entry>

export type TranslationKey = keyof typeof translations

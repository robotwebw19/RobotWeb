type Entry = Record<'en' | 'th', string>

export const translations = {
  // Route error boundary
  'error.title': { en: 'Something went wrong', th: 'เกิดข้อผิดพลาดที่ไม่คาดคิด' },
  'error.subtitle': { en: 'This page hit an unexpected error. Try reloading it.', th: 'หน้านี้เกิดข้อผิดพลาด ลองโหลดหน้าใหม่อีกครั้ง' },
  'error.staleTitle': { en: 'This page needs a refresh', th: 'หน้านี้ต้องโหลดใหม่' },
  'error.staleSubtitle': {
    en: 'The app was updated to a newer version while this tab was open. Reload to get the latest one.',
    th: 'เว็บอัปเดตเป็นเวอร์ชันใหม่ระหว่างที่เปิดหน้านี้ค้างไว้ กดโหลดหน้าใหม่เพื่อใช้เวอร์ชันล่าสุด',
  },
  'error.reload': { en: 'Reload page', th: 'โหลดหน้าใหม่' },
  'error.backHome': { en: '← Back to home', th: '← กลับหน้าหลัก' },

  // Navbar
  'nav.brand': { en: 'URRWNM Line Tracking Robot', th: 'URRWNM Line Tracking Robot' },
  'nav.leaderboard': { en: 'Leaderboard', th: 'กระดานผู้นำ' },
  'nav.profile': { en: 'Profile', th: 'โปรไฟล์' },
  'nav.logout': { en: 'Log out', th: 'ออกจากระบบ' },
  'nav.notSignedIn': { en: 'Not signed in', th: 'ยังไม่ได้เข้าสู่ระบบ' },
  'nav.adminStudents': { en: 'Manage students', th: 'จัดการนักเรียน' },
  'nav.adminSolutions': { en: 'Solutions', th: 'เฉลย' },
  'nav.adminRaceTrack': { en: 'Race track', th: 'สนามแข่ง' },

  // Login
  'login.brand': { en: 'URRWNM Line Tracking Robot', th: 'URRWNM Line Tracking Robot' },
  'login.idHint': { en: 'Enter your 5-digit student ID', th: 'กรอกรหัสนักเรียน 5 หลัก' },
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
  'onboarding.prefixLabel': { en: 'Prefix', th: 'คำนำหน้า' },
  'onboarding.firstNameLabel': { en: 'First name', th: 'ชื่อ' },
  'onboarding.firstNamePlaceholder': { en: 'First name', th: 'ชื่อจริง' },
  'onboarding.lastNameLabel': { en: 'Last name', th: 'นามสกุล' },
  'onboarding.lastNamePlaceholder': { en: 'Last name', th: 'นามสกุล' },
  'onboarding.gradeLabel': { en: 'Grade', th: 'มัธยมศึกษาปีที่' },
  'onboarding.classroomLabel': { en: 'Classroom', th: 'ห้อง' },
  'common.allClassrooms': { en: 'All classrooms', th: 'ทุกห้อง' },
  'common.allGrades': { en: 'All grades', th: 'ทุกชั้น' },
  'onboarding.classroomPlaceholder': { en: 'e.g. 3', th: 'เช่น 3' },
  'onboarding.numberLabel': { en: 'Number', th: 'เลขที่' },
  'onboarding.numberPlaceholder': { en: 'e.g. 12', th: 'เช่น 12' },
  'onboarding.nextButton': { en: 'Next: build your robot', th: 'ถัดไป: สร้างหุ่นยนต์ของคุณ' },
  'onboarding.buildRobotTitle': { en: 'Build your robot', th: 'สร้างหุ่นยนต์ของคุณ' },
  'onboarding.startPlaying': { en: 'Start playing', th: 'เริ่มเล่น' },

  // Sensor configurator
  'sensors.saveRobot': { en: 'Save robot', th: 'บันทึกหุ่นยนต์' },
  'sensors.saveChanges': { en: 'Save changes', th: 'บันทึกการเปลี่ยนแปลง' },
  'sensors.placementPreview': { en: 'Equipment placement preview', th: 'ตัวอย่างตำแหน่งอุปกรณ์' },
  'validation.duplicatePin': {
    en: 'Pin {pin} is assigned to more than one piece of equipment.',
    th: 'พิน {pin} ถูกใช้ซ้ำโดยหลายอุปกรณ์',
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
    en: 'Measures distance to the nearest obstacle ahead, in cm. Wired like a real HC-SR04: a Trig pin you pulse, an Echo pin you read with pulseIn().',
    th: 'วัดระยะห่างจากสิ่งกีดขวางที่ใกล้ที่สุดด้านหน้า หน่วยเซนติเมตร ต่อสายเหมือน HC-SR04 จริง: ขา Trig ที่ส่งพัลส์ กับขา Echo ที่อ่านด้วย pulseIn()',
  },
  'catalog.motor.left.label': { en: 'Left Motor', th: 'มอเตอร์ซ้าย' },
  'catalog.motor.right.label': { en: 'Right Motor', th: 'มอเตอร์ขวา' },
  'catalog.motor.description': {
    en: 'Drives one wheel. Both motors are required to move the robot.',
    th: 'ขับเคลื่อนล้อหนึ่งข้าง ต้องมีมอเตอร์ทั้งสองข้างจึงจะขับหุ่นยนต์ได้',
  },

  // Robot pinout hover panel
  'pinout.title': { en: 'Equipment wiring details', th: 'รายละเอียดการต่ออุปกรณ์' },
  'pinout.digitalHeader': { en: 'Digital pins', th: 'ขาดิจิทัล' },
  'pinout.analogHeader': { en: 'Analog pins', th: 'ขาแอนะล็อก' },
  'pinout.direction1': { en: 'forward', th: 'เดินหน้า' },
  'pinout.direction2': { en: 'backward', th: 'ถอยหลัง' },
  'pinout.speed': { en: 'speed (PWM)', th: 'ความเร็ว (PWM)' },
  'pinout.signal': { en: 'signal', th: 'สัญญาณ' },

  // Left panel tabs
  'leftPanel.levels': { en: 'Levels', th: 'ด่าน' },
  'leftPanel.sensors': { en: 'Equipment', th: 'อุปกรณ์' },
  'leftPanel.editor': { en: 'Level Editor', th: 'สร้างด่าน' },

  // Level list/card
  'level.notCompleted': { en: 'Not completed yet', th: 'ยังไม่ผ่านด่านนี้' },
  'level.passed': { en: 'Passed', th: 'ผ่านแล้ว' },
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
  'result.done': { en: 'Done', th: 'สำเร็จ' },
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
  'leaderboard.classroom': { en: 'Class', th: 'ห้อง' },
  'leaderboard.studentNumber': { en: 'No.', th: 'เลขที่' },
  'leaderboard.time': { en: 'Time', th: 'เวลา' },
  'leaderboard.stars': { en: 'Stars', th: 'ดาว' },
  'leaderboard.date': { en: 'Date', th: 'วันที่' },
  'leaderboard.totalStars': { en: 'Total stars', th: 'ดาวรวม' },
  'leaderboard.levelsPassed': { en: 'Levels passed', th: 'ด่านที่ผ่าน' },

  // Profile
  'profile.gradeAndNumber': { en: 'Grade {grade} · No. {number}', th: 'ชั้น {grade} เลขที่ {number}' },
  'profile.levelsPassed': { en: 'Levels passed', th: 'ด่านที่ผ่าน' },
  'profile.totalStars': { en: 'Total stars', th: 'ดาวรวม' },
  'profile.level': { en: 'Level', th: 'ด่าน' },
  'profile.bestTime': { en: 'Best time', th: 'เวลาดีที่สุด' },

  // Admin
  'admin.title': { en: 'Admin Dashboard', th: 'แผงควบคุมแอดมิน' },
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
  'admin.actions': { en: 'Actions', th: 'จัดการ' },
  'admin.editStudent': { en: 'Edit student', th: 'แก้ไขนักเรียน' },
  'admin.saveStudent': { en: 'Save', th: 'บันทึก' },
  'admin.cancelEdit': { en: 'Cancel', th: 'ยกเลิก' },
  'admin.noStudents': { en: 'No students have signed in yet.', th: 'ยังไม่มีนักเรียนเข้าสู่ระบบ' },
  'admin.manageStudents': { en: 'Manage students →', th: 'จัดการนักเรียน →' },
  'admin.copyCode': { en: 'Copy code', th: 'ก็อปปี้โค้ด' },
  'admin.raceTrackLiveCount': { en: '{count} robot(s) running now', th: 'กำลังวิ่งอยู่ {count} คน' },
  'admin.raceTrackScores': { en: 'Level scores', th: 'คะแนนประจำด่าน' },
  'admin.raceTrackResetAll': { en: 'Reset all scores', th: 'รีเซ็ตคะแนนทั้งหมด' },
  'admin.raceTrackPassToast': { en: '{firstName} #{studentNumber} passed!', th: '{firstName} #{studentNumber} ผ่านด่านแล้ว!' },
  'admin.confirmResetAllScores': {
    en: 'Reset every score for this level? This cannot be undone.',
    th: 'รีเซ็ตคะแนนทั้งหมดของด่านนี้หรือไม่? ไม่สามารถย้อนกลับได้',
  },

  // Seed level names (user-created levels fall back to their own stored name — see getLevelName)
  'level.level-01-straight.name': { en: '1. Straight Line', th: '1. เส้นตรง' },
  'level.level-02-curve.name': { en: '2. Gapped Line', th: '2. เส้นขาดช่วง' },
  'level.level-03-multi-junction.name': { en: '3. Curved Line', th: '3. เส้นโค้ง' },
  'level.level-04-gapped-line.name': { en: '4. Multi-Way Junction', th: '4. ทางแยกหลายทาง' },
  'level.level-05-color-zone.name': { en: '5. Inverted Circle', th: '5. วงกลมสลับสี' },

  // Common
} satisfies Record<string, Entry>

export type TranslationKey = keyof typeof translations

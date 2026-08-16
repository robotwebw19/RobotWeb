export const keys = {
  user: (studentId: string) => `user:${studentId}`,
  userPrefix: 'user:',
  robot: (studentId: string) => `robot:${studentId}`,
  userLevel: (levelId: string) => `level:user:${levelId}`,
  userLevelIndex: 'level:userIndex',
  userCode: (studentId: string, levelId: string) => `usercode:${studentId}:${levelId}`,
  levelResults: (levelId: string) => `results:level:${levelId}`,
  levelResultsPrefix: 'results:level:',
  session: 'session:currentStudentId',
  adminSession: 'session:isAdmin',
}

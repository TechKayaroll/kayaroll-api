const ATTENDANCE_AUDIT_LOG = {
  CREATE: 'CREATE',
  EDIT: 'EDIT',
  APPROVE: 'APPROVE',
  REJECT: 'REJECT',
  DISCARDED: 'DISCARDED',
};

const ATTENDANCE_TYPE = {
  IN: 'In',
  OUT: 'Out',
};

const ATTENDANCE_STATUS = {
  REJECTED: 'Rejected',
  PENDING: 'Pending',
  APPROVED: 'Approved',
  DISCARDED: 'Discarded',
};

const ATTENDANCE_REPORT_STATUS = {
  ABSENT: 'absent',
  PRESENT: 'present',
  INCOMPLETE: 'incomplete',
};

const USER_ROLE = {
  ADMIN: 'admin',
  EMPLOYEE: 'employee',
};

const SHIFT_DAY = {
  SUNDAY: 'sun',
  MONDAY: 'mon',
  TUESDAY: 'tue',
  WEDNESDAY: 'wed',
  THURSDAY: 'thu',
  FRIDAY: 'fri',
  SATURDAY: 'sat',
};

const ATTENDANCE_STATUS_HISTORY = {
  LATE: 'late',
  EARLY_DEPARTURE: 'early-departure',
  OVERTIME: 'overtime',
  ON_TIME: 'on-time',
  NO_SCHEDULE: 'no-schedule',
};

const GOOGLE_MAP_API_BASE_URL = 'https://maps.googleapis.com/maps/api/geocode/json';

module.exports = {
  ATTENDANCE_AUDIT_LOG,
  ATTENDANCE_TYPE,
  ATTENDANCE_STATUS,
  ATTENDANCE_REPORT_STATUS,
  USER_ROLE,
  SHIFT_DAY,
  GOOGLE_MAP_API_BASE_URL,
  ATTENDANCE_STATUS_HISTORY,
};

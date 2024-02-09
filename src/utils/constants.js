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

module.exports = {
  ATTENDANCE_AUDIT_LOG,
  ATTENDANCE_TYPE,
  ATTENDANCE_STATUS,
  ATTENDANCE_REPORT_STATUS,
  USER_ROLE,
};

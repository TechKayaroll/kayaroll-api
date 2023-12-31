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

const USER_ROLE = {
  ADMIN: 'admin',
  EMPLOYEE: 'employee',
};

module.exports = {
  ATTENDANCE_AUDIT_LOG,
  ATTENDANCE_TYPE,
  ATTENDANCE_STATUS,
  USER_ROLE,
};

const ScheduleData = ({
  scheduleName, employeeIds, shifts,
  organizationId, effectiveStartDate,
  effectiveEndDate,
}) => ({
  name: scheduleName,
  users: employeeIds,
  shifts,
  organizationId,
  effectiveStartDate,
  effectiveEndDate,
  isDefault: false,
});

module.exports = {
  ScheduleData,
};

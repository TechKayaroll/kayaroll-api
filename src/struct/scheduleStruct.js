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
const SchedulePagination = (page, limit, totalData) => ({
  totalPage: Math.ceil(totalData / limit),
  currentPage: page,
});

module.exports = {
  ScheduleData,
  SchedulePagination,
};

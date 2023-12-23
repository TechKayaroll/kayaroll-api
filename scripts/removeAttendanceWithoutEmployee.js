/* eslint-disable no-console */
const AttendanceModel = require('../src/models');

const deleteAttendanceWithoutEmployee = async () => {
  try {
    const attendancesWithoutEmployee = await AttendanceModel.Attendance.find({ userId: null });
    const attendanceIdsToDelete = attendancesWithoutEmployee.map((attendance) => attendance._id);
    console.log(attendanceIdsToDelete);
    await AttendanceModel.Attendance.deleteMany({ _id: { $in: attendanceIdsToDelete } });

    console.log('Attendances without employee deleted successfully.');
  } catch (error) {
    console.error('Error deleting attendances:', error);
  }
};

module.exports = deleteAttendanceWithoutEmployee;

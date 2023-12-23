/* eslint-disable no-underscore-dangle */
/* eslint-disable no-console */
const Model = require('../src/models');

const generateUniqueUserIdOnAttendance = async () => {
  try {
    const attendances = await Model.Attendance.find();
    const promises = [];

    attendances.forEach((attendance) => {
      const { _id: attendanceId, userId, organizationId } = attendance;

      const newPromise = new Promise((resolve, reject) => {
        Model.UserOrganization.findOne({ userId, organizationId })
          .then((userOrganization) => {
            if (userOrganization) {
              Model.Attendance.findByIdAndUpdate(
                attendanceId,
                { userOrganizationId: userOrganization._id },
                { new: true },
              ).then((updatedAttendance) => resolve(updatedAttendance)).catch(reject);
            } else {
              console.log(`UserOrganization not found for userID ${userId}, organizationId ${organizationId}. Skipping.`);
              resolve();
            }
          })
          .catch(reject);
      });

      promises.push(newPromise);
    });

    const updatedAttendance = await Promise.all(promises);
    updatedAttendance
      .filter((attendance) => attendance)
      .forEach((attendance) => console.log(`Updated: AttendanceId: ${attendance?._id}, userId ${attendance?.userId} organizationId: ${attendance?.organizationId}, with userOrganizationId ${attendance?.userOrganizationId}`));
  } catch (error) {
    console.error('Error set uniqueUserId Attendance:', error);
  }
};

module.exports = generateUniqueUserIdOnAttendance;

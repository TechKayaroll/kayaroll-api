/* eslint-disable no-param-reassign */
const XLSX = require('xlsx');
// Script: https://stackblitz.com/edit/react-cahvjj?file=src%2FApp.js
const addDataToSheet = (workbook, sheetName, attendanceData) => {
  let worksheet = workbook.Sheets[sheetName];
  if (!worksheet) {
    worksheet = XLSX.utils.aoa_to_sheet([['UserDetail']]);
    workbook.SheetNames.push(sheetName);
    workbook.Sheets[sheetName] = worksheet;
  }

  const {
    user,
    totalDuration: {
      days, hours, minutes, seconds,
    },
    report,
  } = attendanceData;
  const userDetails = Object.entries(user).map(([fieldName, fieldValue]) => [
    fieldName, fieldValue,
  ]);
  XLSX.utils.sheet_add_aoa(worksheet, userDetails, { origin: -1 });

  XLSX.utils.sheet_add_aoa(
    worksheet,
    [['Total Duration', `${days} Days ${hours} Hours ${minutes} Minutes ${seconds} Seconds`]],
    { origin: -1 },
  );
  // Add Empty Row
  XLSX.utils.sheet_add_aoa(worksheet, [[]], { origin: -1 });

  // Reports Data
  if (report && report.length > 0) {
    const tableHeader = ['inTime', 'outTime', 'duration'];
    XLSX.utils.sheet_add_aoa(worksheet, [tableHeader], { origin: -1 });
    report.forEach((reportEntry) => {
      const { inTime, outTime, duration } = reportEntry;
      const row = [
        inTime,
        outTime,
        `${duration.days} Days ${duration.hours} Hours ${duration.minutes} Minutes ${duration.seconds} Seconds`,
      ];

      XLSX.utils.sheet_add_aoa(worksheet, [row], { origin: -1 });
    });
  }
};
const generateAttendanceReports = (reports) => {
  const workbook = XLSX.utils.book_new();
  reports.forEach((reportEntry) => {
    const { user } = reportEntry;
    addDataToSheet(workbook, user.fullname || 'Employee Name', reportEntry);
  });

  return workbook;
};

module.exports = {
  generateAttendanceReports,
};

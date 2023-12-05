/* eslint-disable no-param-reassign */
const ExcelJS = require('exceljs');

// Script: https://stackblitz.com/edit/react-cahvjj?file=src%2FApp.js
const addDataToSheet = (worksheet, attendanceData) => {
  const {
    user,
    totalDuration: {
      days, hours, minutes, seconds,
    },
    report,
  } = attendanceData;

  Object.entries(user).forEach((entry) => {
    const [fieldName, fieldValue] = entry;
    worksheet.addRow([fieldName, fieldValue]);
  });

  // Add total duration
  worksheet.addRow([
    'Total Duration',
    `${days} Days ${hours} Hours ${minutes} Minutes ${seconds} Seconds`,
  ]);

  // Add empty row
  worksheet.addRow([]);

  // Reports Data
  if (report && report.length > 0) {
    const tableHeader = ['inTime', 'outTime', 'duration'];
    worksheet.addRow(tableHeader);
    report.forEach((reportEntry) => {
      const { inTime, outTime, duration } = reportEntry;
      const row = [
        inTime,
        outTime,
        `${duration.days} Days ${duration.hours} Hours ${duration.minutes} Minutes ${duration.seconds} Seconds`,
      ];
      worksheet.addRow(row);
    });
  }
};

const generateAttendanceReports = (reports) => {
  const workbook = new ExcelJS.Workbook();
  reports.forEach((reportEntry) => {
    const { user } = reportEntry;
    const sheetName = user.fullname || 'Employee Name';
    const worksheet = workbook.addWorksheet(sheetName);
    addDataToSheet(worksheet, reportEntry);
  });
  return workbook;
};

module.exports = {
  generateAttendanceReports,
};

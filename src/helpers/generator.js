/* eslint-disable no-param-reassign */
const ExcelJS = require('exceljs');
// https://stackblitz.com/edit/react-export-to-excel-dkeuou?file=src%2FApp.js
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
  worksheet.getColumn(1).width = 30;
  worksheet.getColumn(1).alignment = { wrapText: true };
  worksheet.getColumn(2).width = 30;
  worksheet.getColumn(2).alignment = { wrapText: true };
  // Add empty row
  worksheet.addRow([]);

  // Reports Data
  if (report && report.length > 0) {
    const tableHeader = ['inTime', 'outTime', 'duration'];
    worksheet.addRow(tableHeader);

    worksheet.getColumn(3).width = 30;
    worksheet.getColumn(3).alignment = { wrapText: true };

    report.forEach((reportEntry) => {
      const { inTime, outTime, duration } = reportEntry;
      const row = [
        inTime,
        outTime,
        `${duration.hours} Hours ${duration.minutes} Minutes ${duration.seconds} Seconds`,
      ];
      worksheet.addRow(row);
    });
  }
};

const generateAttendanceReports = (reports) => {
  const workbook = new ExcelJS.Workbook();
  reports.forEach((reportEntry, index) => {
    const { user } = reportEntry;
    const sheetName = `${user.fullname}_${user.email}` || `Employee Name_${index + 1}`;
    const worksheet = workbook.addWorksheet(sheetName);
    addDataToSheet(worksheet, reportEntry);
  });
  return workbook;
};

module.exports = {
  generateAttendanceReports,
};

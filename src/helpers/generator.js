/* eslint-disable no-param-reassign */
const dayjs = require('dayjs');
const ExcelJS = require('exceljs');
// https://stackblitz.com/edit/react-export-to-excel-dkeuou?file=src%2FApp.js

const addDataToSheet = (worksheet, summaryReports) => {
  const {
    user,
    summaryReports: {
      totalDuration: {
        days, hours, minutes, seconds,
      },
      data,
    },
  } = summaryReports;

  Object.entries(user).forEach((entry) => {
    const [fieldName, fieldValue] = entry;
    worksheet.addRow([fieldName, fieldValue]);
  });

  // Add total duration
  worksheet.addRow([
    'Total Duration',
    `${days} Days ${hours} Hours ${minutes} Minutes ${seconds} Seconds`,
  ]);

  new Array(5).fill('').forEach((_, index) => {
    worksheet.getColumn(index + 1).width = 30;
    worksheet.getColumn(index + 1).alignment = { wrapText: true };
  });
  worksheet.addRow([]);

  // Reports Data
  if (data && data.length > 0) {
    const tableHeader = ['Date', 'In Time', 'Out Time', 'Status', 'Duration'];
    worksheet.addRow(tableHeader);

    data.forEach(({ date, attendanceLog }) => {
      const {
        attendanceIn, attendanceOut, duration, status,
      } = attendanceLog;
      const attendanceDate = dayjs(date).format('MM/DD/YYYY');
      const inTime = attendanceIn
        ? dayjs(attendanceIn.attendanceDate).format('hh:mm:ss')
        : '-';
      const outTime = attendanceOut
        ? dayjs(attendanceOut.attendanceDate).format('hh:mm:ss')
        : '-';
      const row = [
        attendanceDate,
        inTime,
        outTime,
        status,
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
    const sheetName = `${user.uniqueUserId}.${user.fullname}` || `${index + 1}.Employee Name`;
    const worksheet = workbook.addWorksheet(sheetName);
    addDataToSheet(worksheet, reportEntry);
  });
  return workbook;
};

module.exports = {
  generateAttendanceReports,
};

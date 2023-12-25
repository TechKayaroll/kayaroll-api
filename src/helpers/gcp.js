const Cloud = require('@google-cloud/storage');
const { StatusCodes } = require('http-status-codes');
const { ResponseError } = require('./response');

const serviceKey = JSON.parse(process.env.GCP_API_KEYS);
const { Storage } = Cloud;
const storage = new Storage({
  credentials: serviceKey,
  projectId: process.env.GCP_PROJECT,
});

const bucket = storage.bucket(process.env.GCP_BUCKET_NAME);

module.exports.UploadFile = async (file) => {
  try {
    const { modifiedName, path: uploadFilePath, attendanceType } = file;
    let filePath = process.env.GCP_FOLDER_ATTENDANCE_IN;
    if (attendanceType === 'Out') {
      filePath = process.env.GCP_FOLDER_ATTENDANCE_OUT;
    }

    const options = {
      destination: `${filePath}/${modifiedName}`,
      preconditionOpts: { ifGenerationMatch: 0 },
    };

    return await bucket.upload(uploadFilePath, options);
  } catch (e) {
    throw new ResponseError(StatusCodes.INTERNAL_SERVER_ERROR, e.message);
  }
};

module.exports.DeleteFile = async (fileName, attendanceType) => {
  try {
    let filePath = process.env.GCP_FOLDER_ATTENDANCE_IN;
    if (attendanceType === 'Out') {
      filePath = process.env.GCP_FOLDER_ATTENDANCE_OUT;
    }

    const file = bucket.file(`${filePath}/${fileName}`);
    const [exists] = await file.exists();
    if (!exists) {
      throw new ResponseError(StatusCodes.NOT_FOUND, 'File not found');
    }
    await file.delete();

    return true;
  } catch (e) {
    throw new ResponseError(StatusCodes.INTERNAL_SERVER_ERROR, e.message);
  }
};
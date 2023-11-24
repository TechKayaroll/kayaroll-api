const Cloud = require('@google-cloud/storage');
const path = require('path');
const httpStatus = require('http-status');
const { ResponseError } = require('./response');

const serviceKey = path.join(__dirname, `./${process.env.GCP_API_KEYS_FILENAME}.json`);

const { Storage } = Cloud;
const storage = new Storage({
  keyFilename: serviceKey,
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
    throw new ResponseError(httpStatus.INTERNAL_SERVER_ERROR, e.message);
  }
};

const AWS = require("aws-sdk");
const stream = require("stream");

const uploadStream = ({ Bucket, Key }) => {
  const s3 = new AWS.S3();
  const pass = new stream.PassThrough();
  return {
    writeStream: pass,
    promise: s3.upload({ Bucket, Key, Body: pass }).promise(),
  };
};

module.exports = {
  uploadStream,
};

const AWS = require("aws-sdk");
const { extractZip } = require("./service/extractZip");
const { logger } = require("./utils/logger");

exports.handler = async (event) => {
  logger.info("Received event:", JSON.stringify(event, null, 2));

  const s3 = new AWS.S3();
  const Bucket = event.Records[0].s3.bucket.name;
  const Key = decodeURIComponent(
    event.Records[0].s3.object.key.replace(/\+/g, " ")
  );
  const params = { Bucket, Key };

  try {
    const object = await s3.getObject(params).promise();
    const result = await extractZip(Bucket, object.Body);

    return {
      status: result && 200,
      response: result && "OK",
    };
  } catch (err) {
    logger.error(err);
    const message = `Error getting object ${Key} from bucket ${Bucket}. Make sure they exist and your bucket is in the same region as this function.`;
    logger.warn(message);
    throw new Error(message);
  }
};

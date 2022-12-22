const { uploadStream } = require("../utils/uploadStream");
const { logger } = require("../utils/logger");
const yauzl = require("yauzl");
const { v4: uuidv4 } = require("uuid");

const extractZip = (Bucket, buffer) => {
  return new Promise((resolve, reject) => {
    yauzl.fromBuffer(buffer, { lazyEntries: true }, function (err, zipfile) {
      if (err) reject(err);
      zipfile.readEntry();
      zipfile.on("entry", function (entry) {
        if (/\/$/.test(entry.fileName)) {
          zipfile.readEntry();
        } else {
          zipfile.openReadStream(entry, function (err, readStream) {
            if (err) reject(err);
            const fileNames = entry.fileName.split(".");
            const { writeStream, promise } = uploadStream({
              Bucket,
              Key: `${fileNames[0]}.${uuidv4()}.${
                fileNames[fileNames.length - 1]
              }`,
            });
            readStream.pipe(writeStream);
            promise.then(() => {
              logger.info(entry.fileName + " Uploaded successfully!");
              zipfile.readEntry();
            });
          });
        }
      });
      zipfile.on("end", () => resolve("end"));
    });
  });
};

module.exports = {
  extractZip,
};

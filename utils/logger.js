const pino = require("pino");
const pinoPretty = require("pino-pretty");

const logger = pino({
  transport: {
    target: pinoPretty,
    options: {
      translateTime: true,
      ignore: "pid.hostname",
    },
  },
});

module.exports = {
  logger,
};

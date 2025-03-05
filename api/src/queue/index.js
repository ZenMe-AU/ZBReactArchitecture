const { Queue } = require("bullmq");
const env = process.env.NODE_ENV || "development";
const config = require("../../config/config.json")[env];

const followUpCmdQueue = new Queue("followUpCmdQueue", {
  connection: config.redis,
});

followUpCmdQueue.on("ready", () => {
  console.log("✅ Queue successfully connected to Redis!");
});

followUpCmdQueue.on("error", (err) => {
  console.error("❌ Error occurred while connecting the queue to Redis:", err);
});

module.exports = {
  followUpCmdQueue,
};

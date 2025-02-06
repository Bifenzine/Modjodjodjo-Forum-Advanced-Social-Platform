import cron from "cron";
import https from "https";
import config from "../config/config.js";

const URL = config.backendUrl;
console.log("URL:", URL);

const job = new cron.CronJob("*/1 * * * *", function () {
  https
    .get(URL, (res) => {
      if (res.statusCode === 200) {
        console.log("GET request sent successfully");
      } else {
        console.log("GET request failed", res.statusCode);
      }
    })
    .on("error", (e) => {
      console.error("Error while sending request", e);
    });
});

export default job;

import { MailtrapClient } from "mailtrap";
import dotenv from "dotenv";
import config from "../config/config.js";

dotenv.config();

export const mailtrapClient = new MailtrapClient({
  endpoint: config.mailtrap.endpoint,
  token: config.mailtrap.token,
});

export const sender = {
  email: "mailtrap@demomailtrap.com",
  name: "Modjodjodjo Forum Team",
};

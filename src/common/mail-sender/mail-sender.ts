import formData from "form-data";
import Mailgun from "mailgun.js";

const mailgun = new Mailgun(formData);

const options = {
  auth: {
    api_key: process.env.MAILGUN_API_KEY as string,
    domain: process.env.MAILGUN_DOMAIN as string,
  },
};

const mg = mailgun.client({ username: "api", key: options.auth.api_key }).messages;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const sendMail = async (mail: any) => {
  try {
    return await mg.create(options.auth.domain, mail);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    throw new Error(error);
  }
};

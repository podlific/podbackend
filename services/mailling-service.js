const nodemailer = require("nodemailer");

class Mailing {
  async sendMail(email, token, type) {
    let transporter = nodemailer.createTransport({
      host: "smtp-mail.outlook.com",
      secureConnection: true,
      starttls: {
        enable: true,
      },
      port: 587,
      tls: {
        ciphers: "SSLv3",
      },
      service: "gmail",
      auth: {
        user: process.env.GMAIL_ID,
        pass: process.env.GMAIL_PASSWORD,
      },
    });
    let URL = process.env.BASE_URL;
    let messageText =
      '<p>Hey,congratulations we have accepted your request.</p><p>Click <a href="' +
      URL +
      "/resetpassword/" +
      token +
      '">here</a> to set password for your account.</p>';
    if (type === 1) {
      messageText =
        '<p>Hey,congratulations we have accepted your request.</p><p>Click <a href="' +
        URL +
        "/resetpassword/" +
        token +
        '">here</a> to set password for your account.</p>';
    } else {
      messageText =
        '<p>Hey , here is your password reset link.</p><p>Click <a href="' +
        URL +
        "/resetpassword/" +
        token +
        '">here</a> to set password for your account.</p>';
    }
    let info1 = await transporter.sendMail({
      from: "tt2504669@gmail.com",
      to: email,
      subject: "Podilific Account Details",
      text: `Hey , generate your password using `,
      html: messageText,
    });
    return info1;
  }
}
module.exports = new Mailing();

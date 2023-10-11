const nodemailer = require("nodemailer");
const pug = require("pug");
const htmlToText = require("html-to-text");

class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstname = user.name;
    this.url = url;
    this.from = "Mcdohl <mcdohl812@gmail.com>";
  }

  newTransport() {
    return nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "mcdohl812@gmail.com",
        pass: "yezlbqcytkfvuqbd",
      },
    });
  }

  async send(template, subject) {
    const html = pug.renderFile(`${__dirname}/../public/${template}.pug`, {
      firstname: this.firstname,
      url: this.url,
      subject,
    });

    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: "something",
    };

    await this.newTransport().sendMail(mailOptions);
  }

  async welcome() {
    await this.send("welcome", "Welcome to Our Blog WEB");
  }

  async chgPassword() {
    await this.send("chgpwd", "Forgot your password?");
  }
}

module.exports = Email;

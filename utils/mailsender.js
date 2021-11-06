const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: "abiolaolalekan39@gmail.com",
    pass: "qupuxxzjhidonydx",
  },
});

const mailsender = (object) => {
  const mailOptions = {
    from: '"Abiola Adeosun" <abiolaolalekan39@gmail.com>', // sender address
    to: object.mail, // list of receivers
    subject: object.subject, // Subject line
    // text: "Hello world from node.js application", // plain text body
    html: object.body, // html body
  };

  // send mail with defined transport object
  transporter.sendMail(mailOptions, (err, info) => {
    if (err) console.log(err.message);
    else console.log("Email sent: %s", info.messageId);
  });
};

module.exports = mailsender;

console.log(module.exports);

const nodemailer = require("nodemailer");

const mailsender = async (object) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: "abiolaolalekan39@gmail.com",
      pass: "qupuxxzjhidonydx",
    },
  });

  try {
    // send mail with defined transport object
    let info = await transporter.sendMail({
      from: '"Abiola Adeosun" <abiolaolalekan39@gmail.com>', // sender address
      to: object.mail, // list of receivers
      subject: object.subject, // Subject line
      // text: "Hello world from node.js application", // plain text body
      html: object.body, // html body
    });

    console.log("Message sent: %s", info.messageId);
    // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
  } catch (error) {
    console.log(error.message);
  }
};

mailsender();

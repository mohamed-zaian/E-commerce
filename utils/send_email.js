import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.HOST_EMAIL,
  port: 465,
  secure: true, // true for 465, false for other ports
  auth: {
    user: process.env.USERNAME_EMAIL,
    pass: process.env.PASSWORD_EMAIL,
  },
});

const sendEmail = async (option) => {
     

    const mailOptions = {
        from: `E-Shop <${process.env.USERNAME_EMAIL}>`,
        to : option.email,
        subject: option.subject,
        text: option.text,
    }
     transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log("NODEMAILER ERROR:", error);
      } else {
        console.log("EMAIL SENT:", info.response);
      }
    });
}

export default sendEmail;
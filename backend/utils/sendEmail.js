const nodemailer = require('nodemailer');

const sendEmail = async (to, subject, html) => {
    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    // Check connection
    transporter.verify(function (error, success) {
        if (error) {
            console.log("EMAIL ERROR:", error);
        } else {
            console.log("EMAIL READY");
        }
    });

    const mailOptions = {
        from: `"Vocentra" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        html
    };

    await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
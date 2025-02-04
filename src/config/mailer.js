import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER, // Your email
    pass: process.env.EMAIL_PASS  // Your email password or app password
  },
});

const sendEmail = async (to, subject, htmlContent, retries = 3) => {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
          const mailOptions = {
            from: `"Room Booking" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html: htmlContent,
          };
    
          await transporter.sendMail(mailOptions);
          console.log(`Email sent to ${to}`);
          return; // Exit if successful
        } catch (error) {
          console.error(`Email send attempt ${attempt} failed:`, error);
          if (attempt === retries) throw error; // Only throw if all retries fail
        }
      }
};

export default sendEmail;

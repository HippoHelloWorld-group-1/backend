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
            attachments: [
              {
                filename: 'logo.webp',
                path: 'https://res.cloudinary.com/dy8gz1xet/image/upload/v1739026034/Group_36_bi9nij.webp',
                cid: 'logoimage' // Attach image inline
              }
            ]
          };
    
          await transporter.sendMail(mailOptions);
          console.log(`Email sent to ${to}`);
          return; 
        } catch (error) {
          console.error(`Email send attempt ${attempt} failed:`, error);
          if (attempt === retries) throw error; 
        }
      }
};

export default sendEmail;

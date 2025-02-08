import dotenv from 'dotenv'
dotenv.config()

export const isValidEmail = (email) => {
    const allowedDomain = process.env.MAILFORMAT;
    const teacherMail = process.env.TEACHERMAIL;
  
    return email.endsWith(allowedDomain) || email.endsWith(teacherMail);
  };
  
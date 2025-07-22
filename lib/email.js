import nodemailer from "nodemailer"

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: true,
  auth:{
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
})

export async function sendResetEmail(email, token){
  const resetUrl = `http://localhost:3000/authusers/ForgetPasswordPage?token=${token}`
  await transporter.sendMail({
    from: '"African Kitchens"<no-reply@Africansfoods>',
    to: email,
    subject: 'Reset Your Password',
    html:`<p><a href="${resetUrl}">Click here to reset your password:</a></p>`
  })
}
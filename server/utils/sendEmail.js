import dotenv from "dotenv"
import nodemailer from "nodemailer"
import { google } from "googleapis"
dotenv.config({
    path: './.env'
})

const oAuth2Client = new google.auth.OAuth2(process.env.CLIENT_ID, process.env.CLIENT_SECRET, process.env.REDIRECT_URI)
oAuth2Client.setCredentials({ refresh_token: process.env.REFRESH_TOKEN })
const sendEmail = async (options) => {

    const accssToken = await oAuth2Client.getAccessToken()

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            type: 'OAuth2',
            user: process.env.SERVICE_MAIL,
            clientId: process.env.CLIENT_ID,
            clientSecret: process.env.CLIENT_SECRET,
            refreshToken: process.env.REFRESH_TOKEN,
            accessToken: accssToken,
        }
    })

    const mailOptions = {
        from: `Animus <${process.env.SERVICE_MAIL}>`,
        to: options.email,
        subject: options.subject,
        text: options.message,
    }

    await transporter.sendMail(mailOptions)
}

export { sendEmail }
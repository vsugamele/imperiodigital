import nodemailer from 'nodemailer';

/**
 * 📧 EMAIL UTILITY
 * Handles sending emails via JP's Gmail
 */

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
    },
});

interface EmailOptions {
    to: string;
    subject: string;
    text?: string;
    html?: string;
}

export async function sendEmail({ to, subject, text, html }: EmailOptions) {
    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
        console.warn('⚠️ GMAIL_USER or GMAIL_APP_PASSWORD not configured. Skipping email.');
        return { success: false, error: 'Config missing' };
    }

    try {
        const info = await transporter.sendMail({
            from: `"JP Freitas" <${process.env.GMAIL_USER}>`,
            to,
            subject,
            text,
            html,
        });

        console.log('✅ Email sent:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error: any) {
        console.error('❌ Error sending email:', error.message);
        return { success: false, error: error.message };
    }
}

export function generateWelcomeEmail(name: string, email: string, password?: string) {
    const loginUrl = 'https://clube.brabas.pro'; // Adjust if needed

    return {
        subject: 'Bem-vinda ao Clube das Brabas! 🚀',
        html: `
            <div style="font-family: sans-serif; line-height: 1.6; color: #333;">
                <h2 style="color: #e91e63;">Olá, ${name}!</h2>
                <p>Seja muito bem-vinda ao <b>Clube das Brabas</b>. Seu acesso foi liberado!</p>
                <p>Aqui estão seus dados de acesso:</p>
                <div style="background: #f4f4f4; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <p style="margin: 5px 0;"><strong>E-mail:</strong> ${email}</p>
                    ${password ? `<p style="margin: 5px 0;"><strong>Senha:</strong> ${password}</p>` : ''}
                </div>
                <p>Você pode acessar a plataforma pelo link abaixo:</p>
                <a href="${loginUrl}" style="display: inline-block; background: #e91e63; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">ACESSAR PLATAFORMA</a>
                <p style="margin-top: 30px; font-size: 0.9em; color: #666;">Se tiver qualquer dúvida, basta responder a este e-mail.</p>
                <p>Bora pra cima! 🚀</p>
                <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;">
                <p style="font-size: 0.8em; color: #999;">JP Freitas - Clube das Brabas</p>
            </div>
        `,
    };
}

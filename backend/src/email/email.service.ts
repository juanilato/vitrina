import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    // Configuración del transporter (puedes usar Gmail, SendGrid, etc.)
    this.transporter = nodemailer.createTransport({
      service: 'gmail', // proovedor
      auth: {
        user: process.env.EMAIL_USER || 'tu-email@gmail.com', // usuario
        pass: process.env.EMAIL_PASSWORD || 'tu-app-password', // contraseña
      },
    });
  }

  // evnio de mail de verificación
  async sendVerificationEmail(email: string, code: string, userName: string): Promise<void> {
    const mailOptions = {
      from: process.env.EMAIL_USER || 'tu-email@gmail.com', // remitente
      to: email, // destino
      subject: 'Verificación de cuenta - Vitrina', // asuto
      html: this.getVerificationEmailTemplate(code, userName), // template
    };

    try {
      // envia mail 
      await this.transporter.sendMail(mailOptions); // usamos nodemailer
    } catch (error) {
      throw new Error(`Error al enviar email: ${error.message}`);
    }
  }

  // template de mail de verificación 
  private getVerificationEmailTemplate(code: string, userName: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Verificación de Cuenta</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #007bff; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
          .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 5px 5px; }
          .code { background: #007bff; color: white; font-size: 24px; font-weight: bold; padding: 15px; text-align: center; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 ¡Bienvenido a Vitrina!</h1>
          </div>
          <div class="content">
            <h2>Hola ${userName},</h2>
            <p>Gracias por registrarte en Vitrina. Para completar tu registro, necesitas verificar tu cuenta usando el siguiente código:</p>
            
            <div class="code">${code}</div>
            
            <p><strong>Este código expirará en 10 minutos.</strong></p>
            
            <p>Si no solicitaste este registro, puedes ignorar este email.</p>
            
            <p>Saludos,<br>El equipo de Vitrina</p>
          </div>
          <div class="footer">
            <p>Este es un email automático, por favor no respondas a este mensaje.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // mail de bienvenida
  async sendWelcomeEmail(email: string, userName: string, userType: string): Promise<void> {
    const mailOptions = {
      from: process.env.EMAIL_USER || 'tu-email@gmail.com',
      to: email,
      subject: '¡Cuenta verificada exitosamente! - Vitrina',
      html: this.getWelcomeEmailTemplate(userName, userType),
    };

    try {
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      // No lanzamos error aquí ya que es solo un email de bienvenida
      console.error('Error al enviar email de bienvenida:', error);
    }
  }

  // template de mail de bienvenida
  private getWelcomeEmailTemplate(userName: string, userType: string): string {
    const userTypeText = userType === 'cliente' ? 'cliente' : 'empresa';
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Cuenta Verificada</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #28a745; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
          .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 5px 5px; }
          .button { background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ ¡Cuenta Verificada!</h1>
          </div>
          <div class="content">
            <h2>¡Felicidades ${userName}!</h2>
            <p>Tu cuenta de ${userTypeText} ha sido verificada exitosamente en Vitrina.</p>
            
            <p>Ahora puedes:</p>
            <ul>
              <li>Iniciar sesión en tu cuenta</li>
              <li>Acceder a todas las funcionalidades</li>
              <li>Personalizar tu perfil</li>
            </ul>
            
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/login" class="button">Iniciar Sesión</a>
            
            <p>¡Bienvenido a la comunidad de Vitrina!</p>
            
            <p>Saludos,<br>El equipo de Vitrina</p>
          </div>
          <div class="footer">
            <p>Este es un email automático, por favor no respondas a este mensaje.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}

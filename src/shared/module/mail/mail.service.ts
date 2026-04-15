import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { AppConfigService } from '../../../config/app/config/config.service';
import { GreetingBodyInterface } from './interface';

@Injectable()
export class MailService {
  constructor(
    private appConfigService: AppConfigService,
    private mailer: MailerService,
  ) {}

  async greetEmail(email: string, body: GreetingBodyInterface) {
    const appName = this.appConfigService.APP_NAME;
    const confirmUrl = `${this.appConfigService.CLIENT_URL}/${body.confirmCode}`;
    await this.mailer.sendMail({
      to: email,
      subject: `${appName} Greeting`,
      html: `
        <p>Hello ${body.name}</p>
        <p>Welcome To ${appName}</p>
        <p>Note: For completing your signup you should confirm your email. Please press the CONFIRM button.</p>
        <p>Attention! This link expires in 15 minutes.</p>
        <p><a href="${confirmUrl}">CONFIRM</a></p>
      `,
    });
  }

  async forgetMail(email: string, forgetCode: string) {
    const appName = this.appConfigService.APP_NAME;
    await this.mailer.sendMail({
      to: email,
      subject: `${appName} Forget Password Confirmation`,
      html: `
        <p>Greeting</p>
        <p>Your confirm code is</p>
        <p><strong>${forgetCode}</strong></p>
        <p>Summary: you got this email because you forgot your password. If you don't want to change your password, ignore this email.</p>
      `,
    });
  }
}

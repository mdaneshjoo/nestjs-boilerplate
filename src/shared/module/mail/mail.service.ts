import { Injectable } from '@nestjs/common';
import { Mailman, MailMessage } from '@squareboat/nest-mailman';
import { AppConfigService } from '../../../config/app/config/config.service';
import { GreetingBodyInterface } from './interface';
@Injectable()
export class MailService {
  constructor(private appConfigService: AppConfigService) {}
  async greetEmail(email: string, body: GreetingBodyInterface) {
    const mail = MailMessage.init()
      .greeting(`Hello ${body.name}`)
      .line(`Welcome To ${this.appConfigService.APP_NAME}`)
      .line(
        'Note: For Completing you signup you should confirm your email. please press CONFIRM button ',
      )
      .line('Attention! this link leaves for 15 minute')
      .action(
        'CONFIRM',
        `${this.appConfigService.CLIENT_URL}/${body.confirmCode}`,
      )
      .subject(`${this.appConfigService.APP_NAME} Greeting`);

    await Mailman.init().to(email).send(mail);
  }

  async forgetMail(email, forgetCode) {
    const mail = MailMessage.init()
      .greeting('Greeting')
      .line('your confirm code is')
      .line(forgetCode)
      .line(
        'Summary:you get this email because you have forget your password if you dont want change your pass ignore this email',
      )
      .subject(
        `${this.appConfigService.APP_NAME} Forget Password Confirmation`,
      );

    await Mailman.init().to(email).send(mail);
  }
}

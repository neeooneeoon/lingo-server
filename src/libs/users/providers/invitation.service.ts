import { MailHelper } from "@helpers/mail.helper";
import { BadRequestException, Injectable } from "@nestjs/common";
import { MailService } from "src/mail/mail.service";
import { UsersService } from "./users.service";

@Injectable()
export class InvitationService {
  constructor(
    private mailService: MailService,
    private usersService: UsersService,
    private mailHelper: MailHelper,
  ) {}
  public async sendInvitation(receiver: string, userId: string): Promise<void> {
    if (!this.mailHelper.isValidEmail(receiver)) {
      throw new BadRequestException('Email invalid');
    }
    const inviter = await this.usersService.findById(userId);
    await this.mailService.sendInvitationEmail(inviter.displayName, receiver);
  }

}
import { ApiProperty } from '@nestjs/swagger';

export class MailInputDto {
  @ApiProperty({
    type: String,
    required: true,
    description: 'Email người muốn mời',
  })
  email: string;
}

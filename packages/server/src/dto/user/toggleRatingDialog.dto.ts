import { ApiProperty } from '@nestjs/swagger';

export class ToggleRatingDialogDto {
  @ApiProperty({
    type: Boolean,
    required: true,
    default: null
  })
  showRatingDialog: boolean;
}

export class ToggleRatingDialogRes {
  @ApiProperty({
    type: Boolean,
    required: true,
    default: null
  })
  showRatingDialog: boolean;
}

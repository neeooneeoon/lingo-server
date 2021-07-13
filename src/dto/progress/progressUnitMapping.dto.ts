import { ApiProperty } from '@nestjs/swagger';

export class ProgressUnitMapping {
  @ApiProperty({ type: String })
  _id: string;

  @ApiProperty({ type: Number })
  unitNId: number;

  @ApiProperty({ type: String })
  name: string;

  @ApiProperty({ type: String })
  description: string;

  @ApiProperty({ type: Number })
  totalLevels: number;

  @ApiProperty({ type: Number })
  totalLessonsOfLevel: number;

  @ApiProperty({ type: Number })
  totalLessons: number;

  @ApiProperty({ type: Number })
  doneLessons: number;

  @ApiProperty({ type: Number })
  userLevel: number;

  @ApiProperty({ type: Number })
  userLesson: number;

  @ApiProperty({ type: String })
  grammar: string;

  @ApiProperty({ type: String })
  tips: string;

  @ApiProperty({ type: String })
  normalImage: string;

  @ApiProperty({ type: String })
  blueImage: string;
}

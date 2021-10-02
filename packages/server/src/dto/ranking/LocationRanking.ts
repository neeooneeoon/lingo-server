import { SubAddress } from '@dto/address';

export class LocationRanking {
  province: number;
  rankings: Array<{
    _id: string;
    totalXp: number;
    subAddress: SubAddress;
  }>;
}

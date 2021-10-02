import { SubAddress } from './SubAddress';

export class GroupAddressDto {
  province: number;
  users: Array<{
    _id: string;
    subAddress: SubAddress;
  }>;
}

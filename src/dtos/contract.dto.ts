import { IsString } from 'class-validator';

export class ContractDto {
  @IsString() clientId: string;
  @IsString() vehicleId: string;
}

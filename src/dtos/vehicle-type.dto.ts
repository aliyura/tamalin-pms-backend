import { IsOptional, IsString } from 'class-validator';

export class VehicleTypeDto {
  @IsString() title: string;
  @IsOptional() description: string;
}

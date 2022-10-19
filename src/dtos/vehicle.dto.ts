import { IsOptional, IsString } from 'class-validator';

export class VehicleDto {
  @IsOptional() model: string;
  @IsString() identityNumber: string;
  @IsString() plateNumber: string;
  @IsOptional() trackerIMEI: string;
  @IsOptional() trackerSIM: string;
}

export class UpdateVehicleDto {
  @IsOptional() plateNumber: string;
  @IsOptional() trackerIMEI: string;
}

export class VehicleStatusUpdateDto {
  @IsOptional() reason: string;
  @IsOptional() description: string;
}

export class VehicleClientChangeDto {
  @IsOptional() newClientUuid: string;
  @IsOptional() description: string;
}

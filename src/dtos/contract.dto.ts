import { IsDateString, IsNumber, IsOptional, IsString } from 'class-validator';

export class ContractDto {
  @IsString() clientId: string;
  @IsString() vehicleId: string;
  @IsString() startDate: string;
  @IsDateString() endDate: string;
  @IsNumber() amount: number;
  @IsOptional() discount: number;
}
export class UpdateContractDto {
  @IsOptional() clientId: string;
  @IsOptional() vehicleId: string;
  @IsOptional() startDate: string;
  @IsOptional() endDate: string;
  @IsOptional() amount: number;
  @IsOptional() discount: number;
}

export class ContractClientDto {
  @IsOptional() id: string;
  @IsOptional() name: string;
  @IsOptional() phoneNumber: string;
}
export class ContractVehicleDto {
  @IsOptional() id: string;
  @IsOptional() plateNumber: string;
  @IsOptional() identityNumber: string;
}

import { IsOptional, IsString } from 'class-validator';

export class UpdateClientDto {
  @IsOptional() name: string;
  @IsOptional() phoneNumber: string;
}

export class ClientStatusUpdateDto {
  @IsOptional() reason: string;
  @IsOptional() description: string;
}

export class ClientGuarantorDto {
  @IsString() name: string;
  @IsString() phoneNumber: string;
  @IsString() identity: string;
  @IsString() identityType: string;
  @IsString() identityNumber: string;
  @IsString() photograph: string;
  @IsString() relationship: string;
  @IsString() address: string;
}
export class ClientContractDto {
  @IsString() id: string;
  @IsString() totalPayable: number;
  @IsString() clearedAmount: number;
  @IsString() totalBalance: number;
  @IsString() instalmentAmount: number;
  @IsString() instalmentPeriod: string;
  @IsOptional() lastInstalmentDate: string;
  @IsString() status: string;
}
export class ClientDto {
  @IsString() name: string;
  @IsString() phoneNumber: string;
  @IsString() identity: string;
  @IsString() identityType: string;
  @IsString() identityNumber: string;
  @IsOptional() photograph: string;
  @IsOptional() guarantorDetail: ClientGuarantorDto;
}

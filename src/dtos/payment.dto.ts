import { IsNumber, IsOptional, IsString } from 'class-validator';

export class PaymentDto {
  @IsString() contractId: string;
  @IsNumber() amount: number;
  @IsString() paymentMode: string;
  @IsOptional() paymentRef: string;
  @IsOptional() narration: string;
}

import { IsNumber, IsString } from 'class-validator';

export class PaymentDto {
  @IsString() contractId: string;
  @IsNumber() amount: number;
  @IsString() paymentRef: string;
  @IsString() narration: string;
}

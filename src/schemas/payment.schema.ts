import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PaymentDocument = Payment & Document;

@Schema({ timestamps: true })
export class Payment {
  @Prop({ type: Types.ObjectId })
  id: string;

  @Prop({ required: true, unique: true })
  puid: string;

  @Prop({ required: true, unique: true })
  code: number;

  @Prop()
  paymentRef: string;

  @Prop()
  remark: string;

  @Prop({ required: true })
  clientId: string;

  @Prop()
  paymentMode: string;

  @Prop({ required: true })
  client: string;

  @Prop({ required: true })
  vehicleId: string;

  @Prop({ required: true })
  contractId: string;

  @Prop({ required: true })
  contractCode: string;

  @Prop({ required: true, default: 0 })
  amount: number;

  @Prop({ required: true })
  createdBy: string;

  @Prop({ required: true })
  createdById: string;

  @Prop({ required: true })
  status: string;

  @Prop()
  statusChangeHistory: any[];

  @Prop()
  updateHistory: any[];

  @Prop()
  lastStatusChangeDate: string;

  @Prop()
  lastUpdatedBy: string;

  @Prop()
  lastUpdatedById: string;
}
export const PaymentSchema = SchemaFactory.createForClass(Payment).index({
  '$**': 'text',
});

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ContractDocument = Contract & Document;

@Schema({ timestamps: true })
export class Contract {
  @Prop({ type: Types.ObjectId })
  id: string;

  @Prop({ required: true, unique: true })
  cuid: string;

  @Prop({ required: true, unique: true })
  code: number;

  @Prop({ required: true })
  clientId: string;

  @Prop({ required: true })
  vehicleId: string;

  @Prop({ required: true })
  createdBy: string;

  @Prop({ required: true })
  createdById: string;

  @Prop({ required: true })
  status: string;

  @Prop()
  statusChangeHistory: any[];

  @Prop()
  lastStatusChangeDate: string;

  @Prop()
  lastUpdatedBy: string;

  @Prop()
  lastUpdatedById: string;
}
export const ContractSchema = SchemaFactory.createForClass(Contract).index({
  '$**': 'text',
});

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

  @Prop({ required: true, unique: true })
  uuid: string;

  @Prop({ required: true })
  status: string;
}
export const ContractSchema = SchemaFactory.createForClass(Contract).index({
  '$**': 'text',
});

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type VehicleDocument = Vehicle & Document;

@Schema({ timestamps: true })
export class Vehicle {
  @Prop({ type: Types.ObjectId })
  id: string;

  @Prop()
  model: string;

  @Prop()
  currentClientUuid: string;

  @Prop()
  currentContractId: string;

  @Prop({ required: true, unique: true })
  code: number;

  @Prop({ required: true, unique: true })
  vuid: string;

  @Prop({ required: true })
  createdBy: string;

  @Prop({ required: true })
  createdById: string;

  @Prop({ required: true })
  plateNumber: string;

  @Prop({ required: true })
  identityNumber: string;

  @Prop()
  trackerIMEI: string;

  @Prop()
  trackerSIM: string;

  @Prop()
  contractHistory: any[];

  @Prop()
  statusChangeHistory: any[];

  @Prop()
  lastStatusChangeDate: string;

  @Prop()
  lastUpdatedBy: string;

  @Prop()
  lastUpdatedById: string;

  @Prop({ required: true })
  status: string;
}

export const VehicleSchema = SchemaFactory.createForClass(Vehicle).index({
  '$**': 'text',
});

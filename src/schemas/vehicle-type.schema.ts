import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type VehicleTypeDocument = VehicleType & Document;

@Schema({ timestamps: true })
export class VehicleType {
  @Prop({ type: Types.ObjectId })
  id: string;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  vtuid: string;

  @Prop()
  description: string;

  @Prop({ required: true })
  status: string;

  @Prop({ required: true })
  code: number;
}

export const VehicleTypeSchema = SchemaFactory.createForClass(VehicleType);

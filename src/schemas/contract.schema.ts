import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ContractClientDto, ContractVehicleDto } from '../dtos/contract.dto';

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
  client: ContractClientDto;

  @Prop({ required: true })
  vehicle: ContractVehicleDto;

  @Prop({ required: true, default: 0 })
  amount: number;

  @Prop({ required: true, default: 0 })
  discount: number;

  @Prop({ required: true })
  createdBy: string;

  @Prop({ required: true })
  createdById: string;

  @Prop({ required: true })
  startDate: string;

  @Prop({ required: true })
  endDate: string;

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
export const ContractSchema = SchemaFactory.createForClass(Contract).index({
  '$**': 'text',
});

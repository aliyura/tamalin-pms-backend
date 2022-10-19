import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ClientGuarantorDto } from 'src/dtos/client.dto';

export type ClientDocument = Client & Document;

@Schema({ timestamps: true })
export class Client {
  @Prop({ type: Types.ObjectId })
  id: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  phoneNumber: string;

  @Prop({ required: true, unique: true })
  uuid: string;

  @Prop({ required: true, unique: true })
  code: number;

  @Prop({ required: true })
  identity: string;

  @Prop({ required: true, unique: true })
  identityNumber: string;

  @Prop({ required: true })
  photograph: string;

  @Prop({ required: true })
  guarantorDetail: ClientGuarantorDto;

  @Prop({ required: true })
  status: string;
}

export const ClientSchema = SchemaFactory.createForClass(Client).index({
  '$**': 'text',
});

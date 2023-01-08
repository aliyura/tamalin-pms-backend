import { Injectable } from '@nestjs/common';
import { Payment, PaymentDocument } from '../../schemas/payment.schema';
import { Vehicle, VehicleDocument } from '../../schemas/vehicle.schema';
import { Client, ClientDocument } from '../../schemas/client.schema';
import { Contract, ContractDocument } from '../../schemas/contract.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Messages } from 'src/utils/messages/messages';
import { Helpers } from 'src/helpers';
import { ApiResponse } from 'src/dtos/ApiResponse.dto';

@Injectable()
export class ReportService {
  constructor(
    @InjectModel(Payment.name) private payment: Model<PaymentDocument>,
    @InjectModel(Vehicle.name) private vehicle: Model<VehicleDocument>,
    @InjectModel(Client.name) private client: Model<ClientDocument>,
    @InjectModel(Contract.name) private contract: Model<ContractDocument>,
  ) {}

  async generateSummaryReport(): Promise<ApiResponse> {
    try {
      const response = {
        clients: await this.client.count({}),
        contracts: await this.contract.count({}),
        vehicles: await this.vehicle.count({}),
        payments: await this.payment.count({}),
      };

      return Helpers.success(response);
    } catch (ex) {
      console.log(Messages.ErrorOccurred, ex);
      return Helpers.fail(Messages.Exception);
    }
  }
}

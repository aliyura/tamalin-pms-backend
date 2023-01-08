import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ApiResponse } from 'src/dtos/ApiResponse.dto';
import { Helpers } from 'src/helpers';
import { PaymentDocument, Payment } from '../../schemas/payment.schema';
import { Status, UserRole } from 'src/enums';
import { Messages } from 'src/utils/messages/messages';
import { PaymentDto } from 'src/dtos/payment.dto';
import { VehicleDocument, Vehicle } from '../../schemas/vehicle.schema';
import { ClientDocument, Client } from '../../schemas/client.schema';
import { User } from '../../schemas/user.schema';
import { Contract, ContractDocument } from 'src/schemas/contract.schema';

@Injectable()
export class PaymentService {
  constructor(
    @InjectModel(Payment.name) private payment: Model<PaymentDocument>,
    @InjectModel(Vehicle.name) private vehicle: Model<VehicleDocument>,
    @InjectModel(Client.name) private client: Model<ClientDocument>,
    @InjectModel(Contract.name) private contract: Model<ContractDocument>,
  ) {}

  async addPayment(
    authenticatedUser: User,
    requestDto: PaymentDto,
  ): Promise<ApiResponse> {
    try {
      if (authenticatedUser.role !== UserRole.ADMIN)
        return Helpers.fail(Messages.NoPermission);

      const contract = await this.contract.findOne({
        cuid: requestDto.contractId,
      });
      if (!contract) return Helpers.fail('Contract not found');

      const client = await this.client.findOne({
        cuid: contract.client.id,
      });
      if (!client) return Helpers.fail('Client not found');

      const vehicle = await this.vehicle.findOne({
        vuid: contract.vehicle.id,
      });
      if (!vehicle) return Helpers.fail('Vehicle not found');

      const code = Helpers.getCode();
      const paymentId = `pay${Helpers.getUniqueId()}`;

      const balance = contract.balance;
      if (balance <= 0)
        return Helpers.fail('Contract does not have pending balance');

      if (requestDto.amount > balance)
        return Helpers.fail('Amount greater than current balance');

      let newBalance = balance - requestDto.amount;
      if (newBalance < 0) newBalance = 0;

      const request = {
        puid: paymentId,
        code: code,
        status: Status.SUCCESSFUL,
        paymentRef: requestDto.paymentRef,
        amount: requestDto.amount,
        clientId: client.cuid,
        client: client.name,
        vehicleId: vehicle.vuid,
        contractId: contract.cuid,
        createdBy: authenticatedUser.name,
        createdById: authenticatedUser.uuid,
      } as Payment;

      const contractStatus = newBalance <= 0 ? Status.COMPLETED : Status.ACTIVE;
      const contractUpdate = {
        status: contractStatus,
        balance: newBalance,
        lastUpdatedBy: authenticatedUser.name,
        lastUpdatedById: authenticatedUser.uuid,
      } as any;

      const update = {
        puid: paymentId,
        paymentRef: requestDto.paymentRef,
        amount: requestDto.amount,
        actionType: 'PAYMENT',
        actionDate: new Date(),
        actionBy: authenticatedUser.name,
        actionByUser: authenticatedUser.uuid,
      };

      const saved = await (await this.payment.create(request)).save();

      await this.contract.updateOne(
        { cuid: contract.cuid },
        {
          $set: contractUpdate,
          $push: {
            updateHistory: update,
          },
        },
        { upsert: true },
      );

      return Helpers.success(saved);
    } catch (ex) {
      console.log(Messages.ErrorOccurred, ex);
      return Helpers.fail(Messages.Exception);
    }
  }

  async cancelPayment(
    authenticatedUser: User,
    paymentId: string,
  ): Promise<ApiResponse> {
    try {
      const existingPayment = await this.payment.findOne({
        puid: paymentId,
      });
      if (!existingPayment) return Helpers.fail('Payment not found');

      if (authenticatedUser.role !== UserRole.ADMIN)
        return Helpers.fail(Messages.NoPermission);

      const contract = await this.contract.findOne({
        cuid: existingPayment.contractId,
      });
      if (!contract) return Helpers.fail('Contract not found');

      const balance = contract.balance;
      let newBalance = balance + existingPayment.amount;
      if (newBalance < 0) newBalance = 0;

      const contractStatus = newBalance <= 0 ? Status.COMPLETED : Status.ACTIVE;
      const contractUpdate = {
        status: contractStatus,
        balance: newBalance,
        lastUpdatedBy: authenticatedUser.name,
        lastUpdatedById: authenticatedUser.uuid,
      } as any;

      const update = {
        puid: paymentId,
        paymentRef: existingPayment.paymentRef,
        amount: existingPayment.amount,
        actionType: 'CANCEL',
        actionDate: new Date(),
        actionBy: authenticatedUser.name,
        actionByUser: authenticatedUser.uuid,
      };
      await this.contract.updateOne(
        { cuid: contract.cuid },
        {
          $set: contractUpdate,
          $push: {
            updateHistory: update,
          },
        },
        { upsert: true },
      );
      await this.payment.deleteOne({
        puid: paymentId,
      });
      return Helpers.success('Payment canceled successfully');
    } catch (ex) {
      console.log(Messages.ErrorOccurred, ex);
      return Helpers.fail(Messages.Exception);
    }
  }

  async findAllPayments(
    page: number,
    authenticatedUser: User,
  ): Promise<ApiResponse> {
    try {
      const size = 20;
      const skip = page || 0;

      const count = await this.payment.count({});
      const result = await this.payment
        .find({})
        .skip(skip * size)
        .limit(size);
      if (result) {
        const totalPages = Math.round(count / size);
        return Helpers.success({
          page: result,
          size: size,
          currentPage: Number(skip),
          totalPages:
            totalPages > 0
              ? totalPages
              : count > 0 && result.length > 0
              ? 1
              : 0,
        });
      }

      return Helpers.fail('Payment not found');
    } catch (ex) {
      console.log(Messages.ErrorOccurred, ex);
      return Helpers.fail(Messages.Exception);
    }
  }

  async searchPayments(
    page: number,
    searchString: string,
    authenticatedUser: User,
  ): Promise<ApiResponse> {
    try {
      const size = 20;
      const skip = page || 0;

      const count = await this.payment.count({
        $text: { $search: searchString },
      });
      const result = await this.payment
        .find({ $text: { $search: searchString } })
        .skip(skip * size)
        .limit(size);

      if (result) {
        const totalPages = Math.round(count / size);
        return Helpers.success({
          page: result,
          size: size,
          currentPage: Number(skip),
          totalPages:
            totalPages > 0
              ? totalPages
              : count > 0 && result.length > 0
              ? 1
              : 0,
        });
      }

      return Helpers.fail('Payment not found');
    } catch (ex) {
      console.log(Messages.ErrorOccurred, ex);
      return Helpers.fail(Messages.Exception);
    }
  }
}

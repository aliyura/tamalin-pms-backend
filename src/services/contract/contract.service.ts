import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ApiResponse } from 'src/dtos/ApiResponse.dto';
import { Helpers } from 'src/helpers';
import { ContractDocument, Contract } from '../../schemas/contract.schema';
import { Status, UserRole } from 'src/enums';
import { Messages } from 'src/utils/messages/messages';
import { UpdateContractDto, ContractDto } from 'src/dtos/contract.dto';
import { VehicleDocument, Vehicle } from '../../schemas/vehicle.schema';
import { ClientDocument, Client } from '../../schemas/client.schema';
import { User } from '../../schemas/user.schema';

@Injectable()
export class ContractService {
  constructor(
    @InjectModel(Contract.name) private contract: Model<ContractDocument>,
    @InjectModel(Vehicle.name) private vehicle: Model<VehicleDocument>,
    @InjectModel(Client.name) private client: Model<ClientDocument>,
  ) {}

  async createContract(
    authenticatedUser: User,
    requestDto: ContractDto,
  ): Promise<ApiResponse> {
    try {
      if (authenticatedUser.role !== UserRole.ADMIN)
        return Helpers.fail(Messages.NoPermission);

      const client = await this.client.findOne({
        cuid: requestDto.clientId,
        status: Status.ACTIVE,
      });
      if (!client) return Helpers.fail('Client not found or inactive');

      const vehicle = await this.vehicle.findOne({
        vuid: requestDto.vehicleId,
        status: Status.ACTIVE,
      });
      if (!vehicle) return Helpers.fail('Vehicle not found or inactive');

      const contractExistByVehicle = await this.contract.findOne({
        'vehicle.id': requestDto.vehicleId,
        status: Status.ACTIVE,
      });
      if (contractExistByVehicle)
        return Helpers.fail('Vehicle already on another contract');

      const contractExistByClient = await this.contract.findOne({
        'client.id': requestDto.clientId,
        status: Status.ACTIVE,
      });
      if (contractExistByClient)
        return Helpers.fail('Client already on another contract');

      const code = Helpers.getCode();
      const contractId = `con${Helpers.getUniqueId()}`;

      const request = {
        status: Status.ACTIVE,
        client: {
          id: client.cuid,
          name: client.name,
          phoneNumber: client.phoneNumber,
        },
        vehicle: {
          id: vehicle.vuid,
          plateNumber: vehicle.plateNumber,
          identityNumber: vehicle.identityNumber,
        },
        amount: requestDto.amount,
        discount: requestDto.discount,
        startDate: requestDto.startDate,
        endDate: requestDto.startDate,
        code: code,
        cuid: contractId,
        createdBy: authenticatedUser.name,
        createdById: authenticatedUser.uuid,
      } as any;

      const saved = await (await this.contract.create(request)).save();
      return Helpers.success(saved);
    } catch (ex) {
      console.log(Messages.ErrorOccurred, ex);
      return Helpers.fail(Messages.Exception);
    }
  }

  async updateContract(
    authenticatedUser: User,
    contractId: string,
    requestDto: UpdateContractDto,
  ): Promise<ApiResponse> {
    try {
      if (authenticatedUser.role !== UserRole.ADMIN)
        return Helpers.fail(Messages.NoPermission);

      const updateHistory = {} as any;
      const existingContract = await this.contract.findOne({
        cuid: contractId,
      });
      if (!existingContract) return Helpers.fail('Contract not found');

      if (
        requestDto.clientId &&
        requestDto.clientId !== existingContract.client.id
      ) {
        const client = await this.client.findOne({
          cuid: requestDto.clientId,
          status: Status.ACTIVE,
        });
        if (!client) return Helpers.fail('Client not found or inactive');

        const contractExistByClient = await this.contract.findOne({
          'client.id': requestDto.clientId,
          status: Status.ACTIVE,
        });
        if (contractExistByClient)
          return Helpers.fail('Client already on another contract');

        //change of client goes here
        updateHistory.prevClient = existingContract.client;
        existingContract.client = {
          id: client.cuid,
          name: client.name,
          phoneNumber: client.phoneNumber,
        };
      }

      if (
        requestDto.vehicleId &&
        requestDto.vehicleId !== existingContract.vehicle.id
      ) {
        const vehicle = await this.vehicle.findOne({
          vuid: requestDto.vehicleId,
          status: Status.ACTIVE,
        });
        if (!vehicle) return Helpers.fail('Vehicle not found or inactive');

        const contractExistByVehicle = await this.contract.findOne({
          'vehicle.id': requestDto.vehicleId,
          status: Status.ACTIVE,
        });
        if (contractExistByVehicle)
          return Helpers.fail('Vehicle already on another contract');

        //change of vehicle goes here
        updateHistory.prevVehicle = existingContract.vehicle;
        existingContract.vehicle = {
          id: vehicle.vuid,
          plateNumber: vehicle.plateNumber,
          identityNumber: vehicle.identityNumber,
        };
      }

      if (requestDto.amount && requestDto.amount !== existingContract.amount) {
        updateHistory.prevAmount = existingContract.amount;
        existingContract.amount = requestDto.amount;
      }
      //update discount
      if (
        requestDto.discount &&
        requestDto.discount !== existingContract.discount
      ) {
        updateHistory.prevAmount = existingContract.discount;
        existingContract.discount = requestDto.discount;
      }

      //update start date
      if (
        requestDto.startDate &&
        requestDto.startDate !== existingContract.startDate
      ) {
        updateHistory.prevStartDate = existingContract.startDate;
        existingContract.startDate = requestDto.startDate;
      }

      //update end date
      if (
        requestDto.endDate &&
        requestDto.endDate !== existingContract.endDate
      ) {
        updateHistory.prevEndDate = existingContract.endDate;
        existingContract.endDate = requestDto.endDate;
      }

      updateHistory.actionDate = new Date();
      updateHistory.actionBy = authenticatedUser.name;
      updateHistory.actionByUser = authenticatedUser.uuid;

      existingContract.lastUpdatedBy = authenticatedUser.name;
      existingContract.lastUpdatedById = authenticatedUser.uuid;

      await (await this.contract.create(existingContract)).save();
      await this.contract.updateOne(
        { cuid: contractId },
        {
          $push: {
            updateHistory: updateHistory,
          },
        },
        { upsert: true },
      );

      return Helpers.success(
        await this.contract.findOne({
          cuid: contractId,
        }),
      );
    } catch (ex) {
      console.log(Messages.ErrorOccurred, ex);
      return Helpers.fail(Messages.Exception);
    }
  }

  async deleteContract(
    authenticatedUser: User,
    contractId: string,
  ): Promise<ApiResponse> {
    try {
      const existingContract = await this.contract.findOne({
        cuid: contractId,
      });
      if (!existingContract) return Helpers.fail('Contract not found');

      if (authenticatedUser.role !== UserRole.ADMIN)
        return Helpers.fail(Messages.NoPermission);

      const response = await this.contract.deleteOne({
        cuid: contractId,
      });
      return Helpers.success(response);
    } catch (ex) {
      console.log(Messages.ErrorOccurred, ex);
      return Helpers.fail(Messages.Exception);
    }
  }

  async updateContractStatus(
    authenticatedUser: User,
    contractId: string,
    status: any,
  ): Promise<ApiResponse> {
    try {
      const existingContract = await this.contract.findOne({
        cuid: contractId,
      });
      if (!existingContract) return Helpers.fail('Contract not found');

      if (authenticatedUser.role !== UserRole.ADMIN) {
        return Helpers.fail(Messages.NoPermission);
      }

      if (!Status[status]) return Helpers.fail('Invalid contract status');

      const request = {
        status: status,
        lastUpdatedBy: authenticatedUser.name,
        lastUpdatedById: authenticatedUser.uuid,
      };

      const statusChangeHistory = {
        status: status,
        actionDate: new Date(),
        actionBy: authenticatedUser.name,
        actionByUser: authenticatedUser.uuid,
      };

      await this.contract.updateOne(
        { cuid: contractId },
        {
          $set: request,
          $push: {
            statusChangeHistory: statusChangeHistory,
          },
        },
        { upsert: true },
      );

      return Helpers.success(
        await this.contract.findOne({
          cuid: contractId,
        }),
      );
    } catch (ex) {
      console.log(Messages.ErrorOccurred, ex);
      return Helpers.fail(Messages.Exception);
    }
  }
  async getAllContracts(
    authenticatedUser: User,
    status: string,
  ): Promise<ApiResponse> {
    try {
      const query = { status: Status.ACTIVE } as any;
      if (
        status &&
        Object.values(Status).includes(status.toUpperCase() as Status)
      ) {
        query.status = status.toUpperCase();
      }

      const contracts = await this.contract.find(query);
      if (contracts && contracts.length > 0) return Helpers.success(contracts);

      return Helpers.fail('Contract not found');
    } catch (ex) {
      console.log(Messages.ErrorOccurred, ex);
      return Helpers.fail(Messages.Exception);
    }
  }

  async searchContracts(
    authenticatedUser: User,
    searchString: string,
  ): Promise<ApiResponse> {
    try {
      const contracts = await this.contract.find({
        $text: { $search: searchString },
      });
      if (contracts && contracts.length > 0) return Helpers.success(contracts);

      return Helpers.fail('Search not found');
    } catch (ex) {
      console.log(Messages.ErrorOccurred, ex);
      return Helpers.fail(Messages.Exception);
    }
  }

  async getContractByCuid(
    authenticatedUser: User,
    cuid: string,
  ): Promise<ApiResponse> {
    try {
      const contract = await this.contract.findOne({ cuid });
      if (contract) return Helpers.success(contract);

      return Helpers.fail('Contract not found');
    } catch (ex) {
      console.log(Messages.ErrorOccurred, ex);
      return Helpers.fail(Messages.Exception);
    }
  }

  async getContractByCode(
    authenticatedUser: User,
    code: string,
  ): Promise<ApiResponse> {
    try {
      const contract = await this.contract.findOne({ code });
      if (contract) return Helpers.success(contract);

      return Helpers.fail('Contract not found');
    } catch (ex) {
      console.log(Messages.ErrorOccurred, ex);
      return Helpers.fail(Messages.Exception);
    }
  }
}

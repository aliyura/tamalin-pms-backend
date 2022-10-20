import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ApiResponse } from 'src/dtos/ApiResponse.dto';
import { Helpers } from 'src/helpers';
import { VehicleDocument, Vehicle } from '../../schemas/vehicle.schema';
import { UserDocument, User } from 'src/schemas/user.schema';
import { Status, UserRole } from 'src/enums';
import { Messages } from 'src/utils/messages/messages';
import { UpdateVehicleDto, VehicleDto } from 'src/dtos/vehicle.dto';

@Injectable()
export class VehicleService {
  constructor(
    @InjectModel(Vehicle.name) private vehicle: Model<VehicleDocument>,
    @InjectModel(User.name) private user: Model<UserDocument>,
  ) {}

  async createVehicle(
    authenticatedUser: User,
    requestDto: VehicleDto,
  ): Promise<ApiResponse> {
    try {
      const vehicleExistByIdentity = await this.vehicle.findOne({
        identityNumber: requestDto.identityNumber,
      });

      if (vehicleExistByIdentity)
        return Helpers.fail('Vehicle identity you provide already exist');

      if (authenticatedUser.role !== UserRole.ADMIN)
        return Helpers.fail(Messages.NoPermission);

      const code = Helpers.getCode();
      const vehicleId = `ve${Helpers.getUniqueId()}`;

      const request = {
        ...requestDto,
        status: Status.ACTIVE,
        code: code,
        vuid: vehicleId,
        createdBy: authenticatedUser.name,
        createdById: authenticatedUser.uuid,
      } as any;

      const saved = await (await this.vehicle.create(request)).save();
      return Helpers.success(saved);
    } catch (ex) {
      console.log(Messages.ErrorOccurred, ex);
      return Helpers.fail(Messages.Exception);
    }
  }

  async updateVehicle(
    authenticatedUser: User,
    vehicleId: string,
    requestDto: UpdateVehicleDto,
  ): Promise<ApiResponse> {
    try {
      const existingVehicle = await this.vehicle.findOne({
        vuid: vehicleId,
      });

      if (!existingVehicle) return Helpers.fail('Vehicle not found');

      const request = {
        ...requestDto,
        lastUpdatedBy: authenticatedUser.name,
        lastUpdatedById: authenticatedUser.uuid,
      } as any;

      await this.vehicle.updateOne({ vuid: vehicleId }, { $set: request });
      return Helpers.success(
        await this.vehicle.findOne({
          vuid: vehicleId,
        }),
      );
    } catch (ex) {
      console.log(Messages.ErrorOccurred, ex);
      return Helpers.fail(Messages.Exception);
    }
  }

  async deleteVehicle(
    authenticatedUser: User,
    vehicleId: string,
  ): Promise<ApiResponse> {
    try {
      const existingVehicle = await this.vehicle.findOne({
        vuid: vehicleId,
      });

      if (!existingVehicle) return Helpers.fail('Vehicle not found');

      if (authenticatedUser.role !== UserRole.ADMIN)
        return Helpers.fail(Messages.NoPermission);

      const response = await this.vehicle.deleteOne({
        vuid: vehicleId,
      });
      return Helpers.success(response);
    } catch (ex) {
      console.log(Messages.ErrorOccurred, ex);
      return Helpers.fail(Messages.Exception);
    }
  }

  async updateVehicleStatus(
    authenticatedUser: User,
    vehicleId: string,
    status: any,
  ): Promise<ApiResponse> {
    try {
      const existingVehicle = await this.vehicle.findOne({
        vuid: vehicleId,
      });
      if (!existingVehicle) return Helpers.fail(Messages.VehicleNotFound);

      if (authenticatedUser.role !== UserRole.ADMIN) {
        return Helpers.fail(Messages.NoPermission);
      }

      if (!Status[status]) return Helpers.fail('Invalid vehicle status');

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

      await this.vehicle.updateOne(
        { vuid: vehicleId },
        {
          $set: request,
          $push: {
            statusChangeHistory: statusChangeHistory,
          },
        },
        { upsert: true },
      );

      return Helpers.success(
        await this.vehicle.findOne({
          vuid: vehicleId,
        }),
      );
    } catch (ex) {
      console.log(Messages.ErrorOccurred, ex);
      return Helpers.fail(Messages.Exception);
    }
  }
  async getAllVehicles(
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

      const vehicles = await this.vehicle.find(query);
      if (vehicles && vehicles.length > 0) return Helpers.success(vehicles);

      return Helpers.fail(Messages.VehicleNotFound);
    } catch (ex) {
      console.log(Messages.ErrorOccurred, ex);
      return Helpers.fail(Messages.Exception);
    }
  }

  async searchVehicles(
    authenticatedUser: User,
    searchString: string,
  ): Promise<ApiResponse> {
    try {
      const vehicles = await this.vehicle.find({
        $text: { $search: searchString },
      });
      if (vehicles && vehicles.length > 0) return Helpers.success(vehicles);

      return Helpers.fail(Messages.VehicleNotFound);
    } catch (ex) {
      console.log(Messages.ErrorOccurred, ex);
      return Helpers.fail(Messages.Exception);
    }
  }

  async getVehicleByVuid(
    authenticatedUser: User,
    vuid: string,
  ): Promise<ApiResponse> {
    try {
      const vehicle = await this.vehicle.findOne({ vuid });
      if (vehicle) return Helpers.success(vehicle);

      return Helpers.fail(Messages.VehicleNotFound);
    } catch (ex) {
      console.log(Messages.ErrorOccurred, ex);
      return Helpers.fail(Messages.Exception);
    }
  }

  async getVehicleByIdentityNumber(
    authenticatedUser: User,
    identityNumber: string,
  ): Promise<ApiResponse> {
    try {
      const vehicle = await this.vehicle.findOne({ identityNumber });
      if (vehicle) return Helpers.success(vehicle);

      return Helpers.fail(Messages.VehicleNotFound);
    } catch (ex) {
      console.log(Messages.ErrorOccurred, ex);
      return Helpers.fail(Messages.Exception);
    }
  }

  async getVehicleByCode(
    authenticatedUser: User,
    code: string,
  ): Promise<ApiResponse> {
    try {
      const vehicle = await this.vehicle.findOne({ code });
      if (vehicle) return Helpers.success(vehicle);

      return Helpers.fail(Messages.VehicleNotFound);
    } catch (ex) {
      console.log(Messages.ErrorOccurred, ex);
      return Helpers.fail(Messages.Exception);
    }
  }
}

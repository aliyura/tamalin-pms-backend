import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ApiResponse } from 'src/dtos/ApiResponse.dto';
import { Helpers } from 'src/helpers';
import { VehicleDocument, Vehicle } from '../../schemas/vehicle.schema';
import { UserDocument, User } from 'src/schemas/user.schema';
import { AuthUserDto } from '../../dtos/user.dto';
import { Status, UserRole } from 'src/enums';
import { Messages } from 'src/utils/messages/messages';
import {
  UpdateVehicleDto,
  VehicleDto,
  VehicleStatusUpdateDto,
} from 'src/dtos/vehicle.dto';

@Injectable()
export class VehicleService {
  constructor(
    @InjectModel(Vehicle.name) private vehicle: Model<VehicleDocument>,
    @InjectModel(User.name) private user: Model<UserDocument>,
  ) {}

  async createVehicle(
    authUser: AuthUserDto,
    requestDto: VehicleDto,
  ): Promise<ApiResponse> {
    try {
      const vehicleExistByIdentity = await this.vehicle.findOne({
        identityNumber: requestDto.identityNumber,
      });

      if (vehicleExistByIdentity)
        return Helpers.fail('Vehicle identity you provide is already exist');

      const authenticatedUser = await this.user.findOne({
        phoneNumber: authUser.username,
      });

      if (authenticatedUser)
        return Helpers.fail('Authenticated User not found');

      if (authenticatedUser.role !== UserRole.ADMIN)
        return Helpers.fail(
          'Your are not authorized to perform this operation',
        );

      const code = Helpers.getCode();
      const vehicleId = `ve${Helpers.getUniqueId()}`;

      const request = {
        ...requestDto,
        status: Status.ACTIVE,
        code: code,
        vuid: vehicleId,
        addedBy: authenticatedUser.uuid,
      } as any;

      const saved = await (await this.vehicle.create(request)).save();
      return Helpers.success(saved);
    } catch (ex) {
      console.log(Messages.ErrorOccurred, ex);
      return Helpers.fail(Messages.Exception);
    }
  }

  async updateVehicle(
    authUser: AuthUserDto,
    vehicleId: string,
    requestDto: UpdateVehicleDto,
  ): Promise<ApiResponse> {
    try {
      const authenticatedUser = await this.user
        .findOne({
          $or: [{ phoneNumber: authUser.username }, { nin: authUser.username }],
        })
        .exec();

      if (!authenticatedUser)
        return Helpers.fail('Authenticated User not found');

      const existingVehicle = await this.vehicle.findOne({
        vuid: vehicleId,
      });

      if (!existingVehicle) return Helpers.fail('Vehicle not found');

      await this.vehicle.updateOne({ vuid: vehicleId }, { $set: requestDto });
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
    authUser: AuthUserDto,
    vehicleId: string,
  ): Promise<ApiResponse> {
    try {
      const authenticatedUser = await this.user
        .findOne({
          $or: [{ phoneNumber: authUser.username }, { nin: authUser.username }],
        })
        .exec();

      if (!authenticatedUser)
        return Helpers.fail('Authenticated User not found');

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
    authUser: AuthUserDto,
    vehicleId: string,
    status: any,
    requestDto: VehicleStatusUpdateDto,
  ): Promise<ApiResponse> {
    try {
      const authenticatedUser = await this.user
        .findOne({
          $or: [{ phoneNumber: authUser.username }, { nin: authUser.username }],
        })
        .exec();

      if (!authenticatedUser)
        return Helpers.fail(Messages.AuthenticatedUserNotFound);

      const existingVehicle = await this.vehicle.findOne({
        vuid: vehicleId,
      });
      if (!existingVehicle) return Helpers.fail(Messages.VehicleNotFound);

      if (authenticatedUser.role !== UserRole.ADMIN) {
        return Helpers.fail(Messages.NoPermission);
      }

      if (!Object.values(Status).includes(status))
        return Helpers.fail('Invalid vehicle status');

      const dateTime = new Date();
      const request = {
        statusChangeDetail: {
          ...requestDto,
          date: dateTime.toISOString().slice(0, 10),
        },
        status: status,
      };

      const statusChangeHistory = {
        ...requestDto,
        status: status,
        actionDate: new Date(),
        actionBy: authenticatedUser.uuid,
        actionByUser: authenticatedUser.name,
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
    authUser: AuthUserDto,
    status: string,
  ): Promise<ApiResponse> {
    try {
      const query = {} as any;

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
    authUser: AuthUserDto,
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

  async getVehicleByRuid(
    authUser: AuthUserDto,
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
    authUser: AuthUserDto,
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
    authUser: AuthUserDto,
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

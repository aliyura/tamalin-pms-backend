import { Injectable } from '@nestjs/common';
import { Status } from 'src/enums';
import { VehicleTypeDto } from '../../dtos/vehicle-type.dto';
import {
  VehicleType,
  VehicleTypeDocument,
} from '../../schemas/vehicle-type.schema';
import { Helpers } from '../../helpers/utitlity.helpers';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { ApiResponse } from '../../dtos/ApiResponse.dto';
import { Messages } from 'src/utils/messages/messages';

@Injectable()
export class VehicleTypeService {
  constructor(
    @InjectModel(VehicleType.name)
    private vehicleType: Model<VehicleTypeDocument>,
  ) {}

  async createVehicleType(requestDto: VehicleTypeDto): Promise<ApiResponse> {
    try {
      const response = await this.vehicleType
        .findOne({
          title: requestDto.title,
        })
        .exec();

      if (response) return Helpers.fail('Vehicle Type Already Exist');

      const request = {
        ...requestDto,
        status: Status.ACTIVE,
        code: Helpers.getCode(),
        vtuid: `vt${Helpers.getUniqueId()}`,
      } as any;

      const saved = await this.vehicleType.create(request);
      return Helpers.success(saved);
    } catch (ex) {
      console.log(Messages.ErrorOccurred, ex);
      return Helpers.fail(Messages.Exception);
    }
  }

  async findVehicleType(vtuid: string): Promise<ApiResponse> {
    try {
      const req = await this.vehicleType.findOne({ vtuid });
      if (req) {
        return Helpers.success(req);
      }
      return Helpers.fail(Messages.VehicleTypeNotFound);
    } catch (ex) {
      console.log(Messages.ErrorOccurred, ex);
      return Helpers.fail(Messages.Exception);
    }
  }

  async deleteVehicleType(vtuid: string): Promise<ApiResponse> {
    try {
      const req = await this.vehicleType.deleteOne({ vtuid });
      if (req) {
        return Helpers.success(req);
      }
      return Helpers.fail(Messages.VehicleTypeNotFound);
    } catch (ex) {
      console.log(Messages.ErrorOccurred, ex);
      return Helpers.fail(Messages.Exception);
    }
  }

  async allVehicleType(): Promise<ApiResponse> {
    try {
      const req = await this.vehicleType.find();
      if (req.length > 0) {
        return Helpers.success(req);
      }
      return Helpers.fail(Messages.VehicleTypeNotFound);
    } catch (ex) {
      console.log(Messages.ErrorOccurred, ex);
      return Helpers.fail(Messages.Exception);
    }
  }
}

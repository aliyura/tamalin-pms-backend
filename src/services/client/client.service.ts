import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ApiResponse } from '../../dtos/ApiResponse.dto';
import { Helpers } from 'src/helpers';
import { Status } from 'src/enums';
import { SmsService } from '../sms/sms.service';
import * as NodeCache from 'node-cache';
import { Messages } from 'src/utils/messages/messages';
import { Client, ClientDocument } from '../../schemas/client.schema';
import { ClientDto, UpdateClientDto } from '../../dtos/client.dto';
import { User } from '../../schemas/user.schema';

@Injectable()
export class ClientService {
  cache = new NodeCache();
  constructor(
    @InjectModel(Client.name) private client: Model<ClientDocument>,
    private readonly smsService: SmsService,
  ) {}

  async createClient(
    authenticatedUser: User,
    requestDto: ClientDto,
  ): Promise<ApiResponse> {
    try {
      if (
        !requestDto.identityNumber ||
        !Helpers.validIdentity(requestDto.identityNumber)
      )
        return Helpers.fail('Identity Number provided is not valid');

      if (
        !requestDto.phoneNumber ||
        !Helpers.validPhoneNumber(requestDto.phoneNumber)
      ) {
        return Helpers.fail('Phone Number provided is not valid');
      }

      const alreadyExistByPhone = await this.existByPhoneNumber(
        requestDto.phoneNumber,
      );
      if (alreadyExistByPhone) return Helpers.fail('Client already exist');

      const alreadyExistByIdentity = await this.existByIdentityNumber(
        requestDto.identityNumber,
      );
      if (alreadyExistByIdentity) return Helpers.fail('Client already exist');

      const request = {
        ...requestDto,
        status: Status.ACTIVE,
        code: Helpers.getCode(),
        cuid: `cl${Helpers.getUniqueId()}`,
        createdBy: authenticatedUser.name,
        createdById: authenticatedUser.uuid,
      } as any;

      const account = await (await this.client.create(request)).save();
      return Helpers.success(account);
    } catch (ex) {
      console.log(Messages.ErrorOccurred, ex);
      return Helpers.fail(Messages.Exception);
    }
  }

  async updateClient(
    authenticatedUser: User,
    cuid: string,
    requestDto: UpdateClientDto,
  ): Promise<any> {
    try {
      if (requestDto && requestDto.phoneNumber) {
        if (!Helpers.validPhoneNumber(requestDto.phoneNumber))
          return Helpers.fail('Invalid phone number');

        const res = await this.findByPhoneNumber(requestDto.phoneNumber);

        if (res && res.success) {
          return Helpers.fail('Client already exist with this phone number ');
        }
      }

      const request = {
        ...requestDto,
        lastUpdatedBy: authenticatedUser.name,
        lastUpdatedById: authenticatedUser.uuid,
      } as any;

      const saved = await this.client.updateOne({ cuid }, { $set: request });
      return Helpers.success(saved);
    } catch (ex) {
      console.log(Messages.ErrorOccurred, ex);
      return Helpers.fail(Messages.Exception);
    }
  }

  async updateStatus(
    authenticatedUser: User,
    cuid: string,
    status: string,
  ): Promise<any> {
    try {
      const statusChangeHistory = {
        status: status,
        actionDate: new Date(),
        actionBy: authenticatedUser.name,
        actionById: authenticatedUser.uuid,
      };
      const request = {
        status: status,
        lastUpdatedBy: authenticatedUser.name,
        lastUpdatedById: authenticatedUser.uuid,
      } as any;

      const saved = await this.client.updateOne(
        { cuid },
        {
          $set: request,
          $push: {
            statusChangeHistory: statusChangeHistory,
          },
        },
      );
      return Helpers.success(saved);
    } catch (ex) {
      console.log(Messages.ErrorOccurred, ex);
      return Helpers.fail(Messages.Exception);
    }
  }

  async findByClientId(cuid: string): Promise<ApiResponse> {
    try {
      const response = await this.client.findOne({ cuid }).exec();
      if (response) return Helpers.success(response);

      return Helpers.fail(Messages.NoClientFound);
    } catch (ex) {
      console.log(Messages.ErrorOccurred, ex);
      return Helpers.fail(Messages.Exception);
    }
  }

  async findByClientCode(code: number): Promise<ApiResponse> {
    try {
      const response = await this.client.findOne({ code }).exec();
      if (response) return Helpers.success(response);

      return Helpers.fail(Messages.NoClientFound);
    } catch (ex) {
      console.log(Messages.ErrorOccurred, ex);
      return Helpers.fail(Messages.Exception);
    }
  }

  async findByPhoneNumber(phoneNumber: string): Promise<ApiResponse> {
    try {
      const response = await this.client.findOne({ phoneNumber }).exec();

      if (response) return Helpers.success(response);

      return Helpers.fail(Messages.NoClientFound);
    } catch (ex) {
      console.log(Messages.ErrorOccurred, ex);
      return Helpers.fail(Messages.Exception);
    }
  }

  async findAllClients(page: number, status: string): Promise<ApiResponse> {
    try {
      const size = 20;
      const skip = page || 0;

      const count = await this.client.count(status ? { status } : {});
      const result = await this.client
        .find(status ? { status } : {})
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

      return Helpers.fail(Messages.NoClientFound);
    } catch (ex) {
      console.log(Messages.ErrorOccurred, ex);
      return Helpers.fail(Messages.Exception);
    }
  }

  async searchClients(
    page: number,
    searchString: string,
  ): Promise<ApiResponse> {
    try {
      const size = 20;
      const skip = page || 0;

      const count = await this.client.count({
        $text: { $search: searchString },
      });
      const result = await this.client
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

      return Helpers.fail(Messages.NoClientFound);
    } catch (ex) {
      console.log(Messages.ErrorOccurred, ex);
      return Helpers.fail(Messages.Exception);
    }
  }

  async existByPhoneNumber(phoneNumber: string): Promise<boolean> {
    try {
      const response = await this.client.findOne({ phoneNumber }).exec();
      if (response) return true;
      return false;
    } catch (ex) {
      console.log(Messages.ErrorOccurred, ex);
      return false;
    }
  }

  async existByIdentityNumber(identityNumber: string): Promise<boolean> {
    try {
      const res = await this.client.findOne({ identityNumber }).exec();
      if (res) return true;
      return false;
    } catch (ex) {
      console.log(Messages.ErrorOccurred, ex);
      return false;
    }
  }
}

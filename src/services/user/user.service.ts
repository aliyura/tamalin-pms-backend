import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { User, UserDocument } from 'src/schemas/user.schema';
import { InjectModel } from '@nestjs/mongoose';

import {
  AuthUserDto,
  ResetPasswordDto,
  UserDto,
  UserUpdateDto,
} from '../../dtos/user.dto';
import { ApiResponse } from '../../dtos/ApiResponse.dto';
import { CryptoService } from '../crypto/crypto.service';
import { Helpers } from 'src/helpers';
import { Status, UserRole } from 'src/enums';
import { SmsService } from '../sms/sms.service';
import * as NodeCache from 'node-cache';
import { Messages } from 'src/utils/messages/messages';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UserService {
  cache = new NodeCache();
  constructor(
    @InjectModel(User.name) private user: Model<UserDocument>,
    private readonly cryptoService: CryptoService,
    private readonly smsService: SmsService,
    private readonly jwtService: JwtService,
  ) {}

  async createUser(requestDto: UserDto): Promise<ApiResponse> {
    try {
      const alreadyExistByPhone = await this.existByPhoneNumber(
        requestDto.phoneNumber,
      );
      if (alreadyExistByPhone) return Helpers.fail('Account already exist');

      const hash = await this.cryptoService.encrypt(requestDto.password);
      requestDto.password = hash;

      if (!Helpers.validNin(requestDto.nin))
        return Helpers.fail('NIN provided is not valid');

      if (!Helpers.validPhoneNumber(requestDto.phoneNumber)) {
        return Helpers.fail('Phone Number provided is not valid');
      }

      const request = {
        ...requestDto,
        status: Status.ACTIVE,
        code: Helpers.getCode(),
        uuid: `us${Helpers.getUniqueId()}`,
      } as any;

      if (!requestDto.role) request.role = UserRole.AGENT;

      const account = await (await this.user.create(request)).save();
      return Helpers.success(account);
    } catch (ex) {
      console.log(Messages.ErrorOccurred, ex);
      return Helpers.fail(Messages.Exception);
    }
  }

  async updateUser(uuid: string, requestDto: UserUpdateDto): Promise<any> {
    try {
      if (requestDto && requestDto.phoneNumber) {
        const res = await this.findByPhoneNumber(requestDto.phoneNumber);

        if (res && res.success) {
          return Helpers.fail('Business already exist with this phone number ');
        }
      }

      const saved = await this.user.updateOne({ uuid }, requestDto);
      return Helpers.success(saved);
    } catch (ex) {
      console.log(Messages.ErrorOccurred, ex);
      return Helpers.fail(Messages.Exception);
    }
  }

  async resetPassword(requestDto: ResetPasswordDto): Promise<ApiResponse> {
    try {
      const res = await this.findByPhoneNumberOrNin(requestDto.username);
      if (res && res.success) {
        const hashedPassword = await this.cryptoService.encrypt(
          requestDto.newPassword,
        );

        await this.user.updateOne(
          { uuid: res.data.uuid },
          { $set: { password: hashedPassword } },
        );
        return Helpers.success(res.data);
      } else {
        return Helpers.fail(Messages.UserNotFound);
      }
    } catch (ex) {
      console.log(Messages.ErrorOccurred, ex);
      return Helpers.fail(Messages.Exception);
    }
  }

  async findByUserToken(authToken: string): Promise<ApiResponse> {
    try {
      const user = (await this.jwtService.decode(authToken)) as AuthUserDto;
      const response = await this.findByPhoneNumberOrNin(user.username);
      if (response.success) {
        const user = response.data as User;
        if (user.status === Status.ACTIVE) {
          return Helpers.success(user);
        } else {
          return Helpers.fail('User is InActive');
        }
      }
      return Helpers.fail(Messages.UserNotFound);
    } catch (ex) {
      console.log(Messages.ErrorOccurred, ex);
      return Helpers.fail(Messages.Exception);
    }
  }
  async findByUserId(userId: string): Promise<ApiResponse> {
    try {
      const response = await this.user.findOne({ uuid: userId }).exec();
      if (response) return Helpers.success(response);

      return Helpers.fail(Messages.UserNotFound);
    } catch (ex) {
      console.log(Messages.ErrorOccurred, ex);
      return Helpers.fail(Messages.Exception);
    }
  }

  async findByUserCode(code: number): Promise<ApiResponse> {
    try {
      const response = await this.user.findOne({ code }).exec();
      if (response) return Helpers.success(response);

      return Helpers.fail(Messages.UserNotFound);
    } catch (ex) {
      console.log(Messages.ErrorOccurred, ex);
      return Helpers.fail(Messages.Exception);
    }
  }

  async findByPhoneNumber(phoneNumber: string): Promise<ApiResponse> {
    try {
      const response = await this.user.findOne({ phoneNumber }).exec();

      if (response) return Helpers.success(response);

      return Helpers.fail(Messages.UserNotFound);
    } catch (ex) {
      console.log(Messages.ErrorOccurred, ex);
      return Helpers.fail(Messages.Exception);
    }
  }
  async findByPhoneNumberOrNin(request: string): Promise<ApiResponse> {
    try {
      const response = await this.user
        .findOne({ $or: [{ phoneNumber: request }, { nin: request }] })
        .exec();

      if (response) return Helpers.success(response);

      return Helpers.fail(Messages.UserNotFound);
    } catch (ex) {
      console.log(Messages.ErrorOccurred, ex);
      return Helpers.fail(Messages.Exception);
    }
  }

  async findAllUsers(page: number, status: string): Promise<ApiResponse> {
    try {
      const size = 20;
      const skip = page || 0;

      const count = await this.user.count(status ? { status } : {});
      const result = await this.user
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

      return Helpers.fail(Messages.NoUserFound);
    } catch (ex) {
      console.log(Messages.ErrorOccurred, ex);
      return Helpers.fail(Messages.Exception);
    }
  }

  async searchUsers(page: number, searchString: string): Promise<ApiResponse> {
    try {
      const size = 20;
      const skip = page || 0;

      const count = await this.user.count({ $text: { $search: searchString } });
      const result = await this.user
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

      return Helpers.fail(Messages.NoUserFound);
    } catch (ex) {
      console.log(Messages.ErrorOccurred, ex);
      return Helpers.fail(Messages.Exception);
    }
  }

  async existByPhoneNumber(phoneNumber: string): Promise<boolean> {
    try {
      const response = await this.user.findOne({ phoneNumber }).exec();
      if (response) return true;
      return false;
    } catch (ex) {
      console.log(Messages.ErrorOccurred, ex);
      return false;
    }
  }

  async existByNIN(nin: string): Promise<boolean> {
    try {
      const res = await this.user.findOne({ nin }).exec();
      if (res) return true;
      return false;
    } catch (ex) {
      console.log(Messages.ErrorOccurred, ex);
      return false;
    }
  }
}

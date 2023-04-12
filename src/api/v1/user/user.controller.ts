import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Headers,
  Post,
  Put,
  UseGuards,
  Query,
} from '@nestjs/common';
import { Helpers } from 'src/helpers';
import { UserService } from 'src/services/user/user.service';
import { UserDto, UserUpdateDto } from '../../../dtos/user.dto';
import { AppGuard } from '../../../services/auth/app.guard';
import { ApiResponse } from '../../../dtos/ApiResponse.dto';
import { ResetPasswordDto } from '../../../dtos/user.dto';
import { UserRole } from '../../../enums/enums';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  // @UseGuards(AppGuard)
  @Post('/')
  async createUser(@Body() requestDto: UserDto): Promise<ApiResponse> {
    const response = await this.userService.createUser(requestDto);
    if (response.success) {
      return response;
    }
    return Helpers.failedHttpResponse(response.message, HttpStatus.BAD_REQUEST);
  }

  @UseGuards(AppGuard)
  @Post('/password-reset')
  async resetPassword(
    @Body() requestDto: ResetPasswordDto,
  ): Promise<ApiResponse> {
    const response = await this.userService.resetPassword(requestDto);
    if (response.success) {
      return response;
    }
    return Helpers.failedHttpResponse(response.message, HttpStatus.BAD_REQUEST);
  }

  @UseGuards(AppGuard)
  @Put('/')
  async updateUser(
    @Body() requestDto: UserUpdateDto,
    @Headers('Authorization') token: string,
  ): Promise<ApiResponse> {
    const authToken = token.substring(7);
    const userResponse = await this.userService.findByUserToken(authToken);
    if (!userResponse.success)
      return Helpers.failedHttpResponse(
        userResponse.message,
        HttpStatus.UNAUTHORIZED,
      );

    if (!userResponse.success) return Helpers.fail(userResponse.message);
    const user = userResponse.data;

    const response = await this.userService.updateUser(user.uuid, requestDto);
    if (response.success) {
      return response;
    }
    return Helpers.failedHttpResponse(response.message, HttpStatus.BAD_REQUEST);
  }

  @UseGuards(AppGuard)
  @Get('/')
  async getUser(@Headers('Authorization') token: string): Promise<ApiResponse> {
    const authToken = token.substring(7);
    const userResponse = await this.userService.findByUserToken(authToken);
    if (!userResponse.success)
      return Helpers.failedHttpResponse(
        userResponse.message,
        HttpStatus.UNAUTHORIZED,
      );

    if (userResponse.success) return userResponse;

    return Helpers.failedHttpResponse(
      userResponse.message,
      HttpStatus.BAD_REQUEST,
    );
  }

  @UseGuards(AppGuard)
  @Get('/list')
  async getAllUsers(
    @Query('page') page: number,
    @Query('status') status: string,
    @Query('role') role: string,
    @Headers('Authorization') token: string,
  ): Promise<ApiResponse> {
    const authToken = token.substring(7);
    const userResponse = await this.userService.findByUserToken(authToken);
    if (!userResponse.success)
      return Helpers.failedHttpResponse(
        userResponse.message,
        HttpStatus.UNAUTHORIZED,
      );

    if (userResponse.data.role === UserRole.ADMIN) {
      const users = await this.userService.findAllUsers(page, status, role);
      if (users.success) return users;
      return Helpers.failedHttpResponse(users.message, HttpStatus.BAD_REQUEST);
    } else {
      return Helpers.failedHttpResponse(
        'You are not authorized user to perform this operation',
        HttpStatus.UNAUTHORIZED,
      );
    }
  }

  @UseGuards(AppGuard)
  @Get('/search')
  async searchUsers(
    @Query('page') page: number,
    @Query('q') searchText: string,
    @Headers('Authorization') token: string,
  ): Promise<ApiResponse> {
    const authToken = token.substring(7);
    const userResponse = await this.userService.findByUserToken(authToken);
    if (!userResponse.success)
      return Helpers.failedHttpResponse(
        userResponse.message,
        HttpStatus.UNAUTHORIZED,
      );

    if (userResponse.data.role === UserRole.ADMIN) {
      const users = await this.userService.searchUsers(page, searchText);
      if (users.success) return users;
      return Helpers.failedHttpResponse(users.message, HttpStatus.BAD_REQUEST);
    } else {
      return Helpers.failedHttpResponse(
        'You are not authorized user to perform this operation',
        HttpStatus.UNAUTHORIZED,
      );
    }
  }
}

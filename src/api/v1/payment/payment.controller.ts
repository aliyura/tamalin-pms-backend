import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  HttpStatus,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiResponse } from 'src/dtos/ApiResponse.dto';
import { Helpers } from 'src/helpers';
import { AppGuard } from 'src/services/auth/app.guard';
import { UserService } from '../../../services/user/user.service';
import { PaymentDto } from '../../../dtos/payment.dto';
import { PaymentService } from '../../../services/payment/payment.service';
import { UserRole } from '../../../enums/enums';
import { Messages } from '../../../utils/messages/messages';

@Controller('payment')
export class PaymentController {
  constructor(
    private userService: UserService,
    private paymentService: PaymentService,
  ) {}

  @UseGuards(AppGuard)
  @Post('/')
  async createPayment(
    @Headers('Authorization') token: string,
    @Body() requestDto: PaymentDto,
  ): Promise<ApiResponse> {
    const authToken = token.substring(7);
    const authUserResponse = await this.userService.findByUserToken(authToken);
    if (!authUserResponse.success)
      return Helpers.failedHttpResponse(
        authUserResponse.message,
        HttpStatus.UNAUTHORIZED,
      );

    const response = await this.paymentService.addPayment(
      authUserResponse.data,
      requestDto,
    );
    if (response.success) {
      return response;
    }
    return Helpers.failedHttpResponse(response.message, HttpStatus.BAD_REQUEST);
  }

  @UseGuards(AppGuard)
  @Delete('/:puid')
  async deletePayment(
    @Headers('Authorization') token: string,
    @Param('puid') puid: string,
  ): Promise<ApiResponse> {
    const authToken = token.substring(7);
    const authUserResponse = await this.userService.findByUserToken(authToken);
    if (!authUserResponse.success)
      return Helpers.failedHttpResponse(
        authUserResponse.message,
        HttpStatus.UNAUTHORIZED,
      );
    const response = await this.paymentService.cancelPayment(
      authUserResponse.data,
      puid,
    );
    if (response.success) {
      return response;
    }
    return Helpers.failedHttpResponse(response.message, HttpStatus.BAD_REQUEST);
  }

  @UseGuards(AppGuard)
  @Get('/list')
  async getAllPayments(
    @Query('page') page: number,
    @Headers('Authorization') token: string,
  ): Promise<ApiResponse> {
    const authToken = token.substring(7);
    const authUserResponse = await this.userService.findByUserToken(authToken);
    if (!authUserResponse.success)
      return Helpers.failedHttpResponse(
        authUserResponse.message,
        HttpStatus.UNAUTHORIZED,
      );

    if (authUserResponse.data.role === UserRole.ADMIN) {
      const result = await this.paymentService.findAllPayments(
        page,
        authUserResponse.data,
      );
      if (result.success) return result;
      return Helpers.failedHttpResponse(result.message, HttpStatus.BAD_REQUEST);
    } else {
      return Helpers.failedHttpResponse(
        Messages.NoPermission,
        HttpStatus.UNAUTHORIZED,
      );
    }
  }

  @UseGuards(AppGuard)
  @Get('/search')
  async searchPayments(
    @Query('page') page: number,
    @Query('q') searchText: string,
    @Headers('Authorization') token: string,
  ): Promise<ApiResponse> {
    const authToken = token.substring(7);
    const authUserResponse = await this.userService.findByUserToken(authToken);
    if (!authUserResponse.success)
      return Helpers.failedHttpResponse(
        authUserResponse.message,
        HttpStatus.UNAUTHORIZED,
      );

    if (authUserResponse.data.role === UserRole.ADMIN) {
      const result = await this.paymentService.searchPayments(
        page,
        searchText,
        authUserResponse.data,
      );
      if (result.success) return result;
      return Helpers.failedHttpResponse(result.message, HttpStatus.BAD_REQUEST);
    } else {
      return Helpers.failedHttpResponse(
        Messages.NoPermission,
        HttpStatus.UNAUTHORIZED,
      );
    }
  }
}

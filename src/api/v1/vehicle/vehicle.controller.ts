import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiResponse } from 'src/dtos/ApiResponse.dto';
import { Helpers } from 'src/helpers';
import { AppGuard } from 'src/services/auth/app.guard';
import { UpdateVehicleDto, VehicleDto } from '../../../dtos/vehicle.dto';
import { VehicleService } from 'src/services/vehicle/vehicle.service';
import { UserService } from '../../../services/user/user.service';
import { Messages } from '../../../utils/messages/messages';
import { UserRole } from '../../../enums/enums';

@Controller('vehicle')
export class VehicleController {
  constructor(
    private vehicleService: VehicleService,
    private userService: UserService,
  ) {}

  @UseGuards(AppGuard)
  @Post('/')
  async createVehicle(
    @Headers('Authorization') token: string,
    @Body() requestDto: VehicleDto,
  ): Promise<ApiResponse> {
    const authToken = token.substring(7);
    const authUserResponse = await this.userService.findByUserToken(authToken);
    if (!authUserResponse.success)
      return Helpers.failedHttpResponse(
        authUserResponse.message,
        HttpStatus.UNAUTHORIZED,
      );

    const response = await this.vehicleService.createVehicle(
      authUserResponse.data,
      requestDto,
    );
    if (response.success) {
      return response;
    }
    return Helpers.failedHttpResponse(response.message, HttpStatus.BAD_REQUEST);
  }

  @UseGuards(AppGuard)
  @Put('/:vuid')
  async updateVehicle(
    @Headers('Authorization') token: string,
    @Param('vuid') vuid: string,
    @Body() requestDto: UpdateVehicleDto,
  ): Promise<ApiResponse> {
    const authToken = token.substring(7);
    const authUserResponse = await this.userService.findByUserToken(authToken);
    if (!authUserResponse.success)
      return Helpers.failedHttpResponse(
        authUserResponse.message,
        HttpStatus.UNAUTHORIZED,
      );
    const response = await this.vehicleService.updateVehicle(
      authUserResponse.data,
      vuid,
      requestDto,
    );
    if (response.success) {
      return response;
    }
    return Helpers.failedHttpResponse(response.message, HttpStatus.BAD_REQUEST);
  }

  @UseGuards(AppGuard)
  @Delete('/:vuid')
  async deleteVehicle(
    @Headers('Authorization') token: string,
    @Param('vuid') vuid: string,
  ): Promise<ApiResponse> {
    const authToken = token.substring(7);
    const authUserResponse = await this.userService.findByUserToken(authToken);
    if (!authUserResponse.success)
      return Helpers.failedHttpResponse(
        authUserResponse.message,
        HttpStatus.UNAUTHORIZED,
      );
    const response = await this.vehicleService.deleteVehicle(
      authUserResponse.data,
      vuid,
    );
    if (response.success) {
      return response;
    }
    return Helpers.failedHttpResponse(response.message, HttpStatus.BAD_REQUEST);
  }

  @UseGuards(AppGuard)
  @Put('/status/change/:vuid')
  async updateVehicleStatus(
    @Headers('Authorization') token: string,
    @Param('vuid') vuid: string,
    @Query('status') status: string,
  ): Promise<ApiResponse> {
    const authToken = token.substring(7);
    const authUserResponse = await this.userService.findByUserToken(authToken);
    if (!authUserResponse.success)
      return Helpers.failedHttpResponse(
        authUserResponse.message,
        HttpStatus.UNAUTHORIZED,
      );

    const response = await this.vehicleService.updateVehicleStatus(
      authUserResponse.data,
      vuid,
      status,
    );
    if (response.success) {
      return response;
    }
    return Helpers.failedHttpResponse(response.message, HttpStatus.BAD_REQUEST);
  }

  @UseGuards(AppGuard)
  @Get('/list')
  async getAllContracts(
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
      const result = await this.vehicleService.findAllVehicles(
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
  async searchContracts(
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
      const result = await this.vehicleService.searchVehicles(
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
  @UseGuards(AppGuard)
  @Get('/detail/:vuid')
  async getVehicleByRuid(
    @Headers('Authorization') token: string,
    @Param('vuid') vuid: string,
  ): Promise<ApiResponse> {
    const authToken = token.substring(7);
    const authUserResponse = await this.userService.findByUserToken(authToken);
    if (!authUserResponse.success)
      return Helpers.failedHttpResponse(
        authUserResponse.message,
        HttpStatus.UNAUTHORIZED,
      );

    const response = await this.vehicleService.getVehicleByVuid(
      authUserResponse.data,
      vuid,
    );
    if (response.success) {
      return response;
    }
    return Helpers.failedHttpResponse(response.message, HttpStatus.BAD_REQUEST);
  }
}

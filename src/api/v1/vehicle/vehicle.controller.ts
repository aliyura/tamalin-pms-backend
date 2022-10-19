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
import { AuthUserDto } from '../../../dtos/user.dto';
import { JwtService } from '@nestjs/jwt';
import {
  UpdateVehicleDto,
  VehicleDto,
  VehicleStatusUpdateDto,
} from '../../../dtos/vehicle.dto';
import { VehicleService } from 'src/services/vehicle/vehicle.service';

@Controller('resource')
export class VehicleController {
  constructor(
    private resourceService: VehicleService,
    private jwtService: JwtService,
  ) {}

  @UseGuards(AppGuard)
  @Post('/')
  async createVehicle(
    @Headers('Authorization') token: string,
    @Body() requestDto: VehicleDto,
  ): Promise<ApiResponse> {
    const authToken = token.substring(7);
    const user = (await this.jwtService.decode(authToken)) as AuthUserDto;

    const response = await this.resourceService.createVehicle(user, requestDto);
    if (response.success) {
      return response;
    }
    return Helpers.failedHttpResponse(response.message, HttpStatus.BAD_REQUEST);
  }

  @UseGuards(AppGuard)
  @Put('/:vehicleId')
  async updateVehicle(
    @Headers('Authorization') token: string,
    @Param('vehicleId') vehicleId: string,
    @Body() requestDto: UpdateVehicleDto,
  ): Promise<ApiResponse> {
    const authToken = token.substring(7);
    const user = (await this.jwtService.decode(authToken)) as AuthUserDto;
    const response = await this.resourceService.updateVehicle(
      user,
      vehicleId,
      requestDto,
    );
    if (response.success) {
      return response;
    }
    return Helpers.failedHttpResponse(response.message, HttpStatus.BAD_REQUEST);
  }

  @UseGuards(AppGuard)
  @Delete('/:vehicleId')
  async deleteVehicle(
    @Headers('Authorization') token: string,
    @Param('vehicleId') vehicleId: string,
  ): Promise<ApiResponse> {
    const authToken = token.substring(7);
    const user = (await this.jwtService.decode(authToken)) as AuthUserDto;
    const response = await this.resourceService.deleteVehicle(user, vehicleId);
    if (response.success) {
      return response;
    }
    return Helpers.failedHttpResponse(response.message, HttpStatus.BAD_REQUEST);
  }

  @UseGuards(AppGuard)
  @Put('/status/update/:vehicleId')
  async updateVehicleStatus(
    @Headers('Authorization') token: string,
    @Param('vehicleId') vehicleId: string,
    @Query('status') status: string,
    @Body() requestDto: VehicleStatusUpdateDto,
  ): Promise<ApiResponse> {
    const authToken = token.substring(7);
    const user = (await this.jwtService.decode(authToken)) as AuthUserDto;

    const response = await this.resourceService.updateVehicleStatus(
      user,
      vehicleId,
      status,
      requestDto,
    );
    if (response.success) {
      return response;
    }
    return Helpers.failedHttpResponse(response.message, HttpStatus.BAD_REQUEST);
  }

  @UseGuards(AppGuard)
  @Get('/')
  async getMyVehicles(
    @Query('status') status: string,
    @Headers('Authorization') token: string,
  ): Promise<ApiResponse> {
    const authToken = token.substring(7);
    const user = (await this.jwtService.decode(authToken)) as AuthUserDto;

    const response = await this.resourceService.getAllVehicles(user, status);
    if (response.success) {
      return response;
    }
    return Helpers.failedHttpResponse(response.message, HttpStatus.BAD_REQUEST);
  }

  @UseGuards(AppGuard)
  @Get('/search')
  async searchMyVehicles(
    @Query('q') searchString: string,
    @Headers('Authorization') token: string,
  ): Promise<ApiResponse> {
    const authToken = token.substring(7);
    const user = (await this.jwtService.decode(authToken)) as AuthUserDto;

    const response = await this.resourceService.searchVehicles(
      user,
      searchString,
    );
    if (response.success) {
      return response;
    }
    return Helpers.failedHttpResponse(response.message, HttpStatus.BAD_REQUEST);
  }
  @UseGuards(AppGuard)
  @Get('/:ruid')
  async getVehicleByRuid(
    @Headers('Authorization') token: string,
    @Param('ruid') ruid: string,
  ): Promise<ApiResponse> {
    const authToken = token.substring(7);
    const user = (await this.jwtService.decode(authToken)) as AuthUserDto;

    const response = await this.resourceService.getVehicleByRuid(user, ruid);
    if (response.success) {
      return response;
    }
    return Helpers.failedHttpResponse(response.message, HttpStatus.BAD_REQUEST);
  }

  @UseGuards(AppGuard)
  @Get('/search/byidentity/:identityNumber')
  async getVehicleByIdentityNumber(
    @Headers('Authorization') token: string,
    @Param('identityNumber') identityNumber: string,
  ): Promise<ApiResponse> {
    const authToken = token.substring(7);
    const user = (await this.jwtService.decode(authToken)) as AuthUserDto;

    const response = await this.resourceService.getVehicleByIdentityNumber(
      user,
      identityNumber,
    );
    if (response.success) {
      return response;
    }
    return Helpers.failedHttpResponse(response.message, HttpStatus.BAD_REQUEST);
  }

  @UseGuards(AppGuard)
  @Get('/search/bycode/:code')
  async getVehicleByCode(
    @Headers('Authorization') token: string,
    @Param('code') code: string,
  ): Promise<ApiResponse> {
    const authToken = token.substring(7);
    const user = (await this.jwtService.decode(authToken)) as AuthUserDto;

    const response = await this.resourceService.getVehicleByCode(user, code);
    if (response.success) {
      return response;
    }
    return Helpers.failedHttpResponse(response.message, HttpStatus.BAD_REQUEST);
  }
}

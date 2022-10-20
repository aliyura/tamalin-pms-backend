import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiResponse } from 'src/dtos/ApiResponse.dto';
import { Helpers } from 'src/helpers';
import { AppGuard } from 'src/services/auth/app.guard';
import { VehicleTypeService } from 'src/services/vehicle-type/vehicle-type.service';
import { VehicleTypeDto } from '../../../dtos/vehicle-type.dto';

@Controller('vehicle-type')
export class VehicleTypeController {
  constructor(private readonly vehicleTypeService: VehicleTypeService) {}
  @UseGuards(AppGuard)
  @Post('/')
  async createVehicleType(
    @Body() requestDto: VehicleTypeDto,
  ): Promise<ApiResponse> {
    const response = await this.vehicleTypeService.createVehicleType(
      requestDto,
    );
    if (response.success) {
      return response;
    }
    return Helpers.failedHttpResponse(response.message, HttpStatus.BAD_REQUEST);
  }

  @UseGuards(AppGuard)
  @Delete('/:id')
  async deleteVehicleType(@Param('id') id: string): Promise<ApiResponse> {
    const response = await this.vehicleTypeService.deleteVehicleType(id);
    if (response.success) {
      return response;
    }
    return Helpers.failedHttpResponse(response.message, HttpStatus.BAD_REQUEST);
  }

  @Get('/')
  async allVehicleType(): Promise<ApiResponse> {
    const response = await this.vehicleTypeService.allVehicleType();
    if (response.success) {
      return response;
    }
    return Helpers.failedHttpResponse(response.message, HttpStatus.BAD_REQUEST);
  }
}

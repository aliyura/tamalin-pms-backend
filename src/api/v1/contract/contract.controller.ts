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
import { UserService } from '../../../services/user/user.service';
import { ContractDto, UpdateContractDto } from '../../../dtos/contract.dto';
import { ContractService } from '../../../services/contract/contract.service';

@Controller('contract')
export class ContractController {
  constructor(
    private userService: UserService,
    private contractService: ContractService,
  ) {}

  @UseGuards(AppGuard)
  @Post('/')
  async createContract(
    @Headers('Authorization') token: string,
    @Body() requestDto: ContractDto,
  ): Promise<ApiResponse> {
    const authToken = token.substring(7);
    const authUserResponse = await this.userService.findByUserToken(authToken);
    if (!authUserResponse.success)
      return Helpers.failedHttpResponse(
        authUserResponse.message,
        HttpStatus.UNAUTHORIZED,
      );

    const response = await this.contractService.createContract(
      authUserResponse.data,
      requestDto,
    );
    if (response.success) {
      return response;
    }
    return Helpers.failedHttpResponse(response.message, HttpStatus.BAD_REQUEST);
  }

  @UseGuards(AppGuard)
  @Put('/:cuid')
  async updateVehicle(
    @Headers('Authorization') token: string,
    @Param('cuid') cuid: string,
    @Body() requestDto: UpdateContractDto,
  ): Promise<ApiResponse> {
    const authToken = token.substring(7);
    const authUserResponse = await this.userService.findByUserToken(authToken);
    if (!authUserResponse.success)
      return Helpers.failedHttpResponse(
        authUserResponse.message,
        HttpStatus.UNAUTHORIZED,
      );
    const response = await this.contractService.updateContract(
      authUserResponse.data,
      cuid,
      requestDto,
    );
    if (response.success) {
      return response;
    }
    return Helpers.failedHttpResponse(response.message, HttpStatus.BAD_REQUEST);
  }

  @UseGuards(AppGuard)
  @Delete('/:cuid')
  async deleteVehicle(
    @Headers('Authorization') token: string,
    @Param('cuid') cuid: string,
  ): Promise<ApiResponse> {
    const authToken = token.substring(7);
    const authUserResponse = await this.userService.findByUserToken(authToken);
    if (!authUserResponse.success)
      return Helpers.failedHttpResponse(
        authUserResponse.message,
        HttpStatus.UNAUTHORIZED,
      );
    const response = await this.contractService.deleteContract(
      authUserResponse.data,
      cuid,
    );
    if (response.success) {
      return response;
    }
    return Helpers.failedHttpResponse(response.message, HttpStatus.BAD_REQUEST);
  }

  @UseGuards(AppGuard)
  @Put('/status/change/:cuid')
  async updateVehicleStatus(
    @Headers('Authorization') token: string,
    @Param('cuid') cuid: string,
    @Query('status') status: string,
  ): Promise<ApiResponse> {
    const authToken = token.substring(7);
    const authUserResponse = await this.userService.findByUserToken(authToken);
    if (!authUserResponse.success)
      return Helpers.failedHttpResponse(
        authUserResponse.message,
        HttpStatus.UNAUTHORIZED,
      );

    const response = await this.contractService.updateContractStatus(
      authUserResponse.data,
      cuid,
      status,
    );
    if (response.success) {
      return response;
    }
    return Helpers.failedHttpResponse(response.message, HttpStatus.BAD_REQUEST);
  }

  @UseGuards(AppGuard)
  @Get('/list')
  async getContracts(
    @Query('status') status: string,
    @Headers('Authorization') token: string,
  ): Promise<ApiResponse> {
    const authToken = token.substring(7);
    const authUserResponse = await this.userService.findByUserToken(authToken);
    if (!authUserResponse.success)
      return Helpers.failedHttpResponse(
        authUserResponse.message,
        HttpStatus.UNAUTHORIZED,
      );

    const response = await this.contractService.getAllContracts(
      authUserResponse.data,
      status,
    );
    if (response.success) {
      return response;
    }
    return Helpers.failedHttpResponse(response.message, HttpStatus.BAD_REQUEST);
  }

  @UseGuards(AppGuard)
  @Get('/search')
  async searchMyContracts(
    @Query('q') searchString: string,
    @Headers('Authorization') token: string,
  ): Promise<ApiResponse> {
    const authToken = token.substring(7);
    const authUserResponse = await this.userService.findByUserToken(authToken);
    if (!authUserResponse.success)
      return Helpers.failedHttpResponse(
        authUserResponse.message,
        HttpStatus.UNAUTHORIZED,
      );

    const response = await this.contractService.searchContracts(
      authUserResponse.data,
      searchString,
    );
    if (response.success) {
      return response;
    }
    return Helpers.failedHttpResponse(response.message, HttpStatus.BAD_REQUEST);
  }
  @UseGuards(AppGuard)
  @Get('/detail/:cuid')
  async getVehicleByRuid(
    @Headers('Authorization') token: string,
    @Param('cuid') cuid: string,
  ): Promise<ApiResponse> {
    const authToken = token.substring(7);
    const authUserResponse = await this.userService.findByUserToken(authToken);
    if (!authUserResponse.success)
      return Helpers.failedHttpResponse(
        authUserResponse.message,
        HttpStatus.UNAUTHORIZED,
      );

    const response = await this.contractService.getContractByCuid(
      authUserResponse.data,
      cuid,
    );
    if (response.success) {
      return response;
    }
    return Helpers.failedHttpResponse(response.message, HttpStatus.BAD_REQUEST);
  }
}

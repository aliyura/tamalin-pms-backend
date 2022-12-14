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
import { Messages } from '../../../utils/messages/messages';
import { UserRole } from 'src/enums';

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
      const result = await this.contractService.findAllContracts(
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
      const result = await this.contractService.searchContracts(
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

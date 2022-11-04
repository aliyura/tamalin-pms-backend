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
  Param,
} from '@nestjs/common';
import { Helpers } from 'src/helpers';
import { ClientDto, UpdateClientDto } from '../../../dtos/client.dto';
import { AppGuard } from '../../../services/auth/app.guard';
import { ApiResponse } from '../../../dtos/ApiResponse.dto';
import { UserService } from 'src/services/user/user.service';
import { ClientService } from '../../../services/client/client.service';
import { UserRole, Status } from '../../../enums/enums';
import { Messages } from '../../../utils/messages/messages';

@Controller('client')
export class ClientController {
  constructor(
    private clientService: ClientService,
    private userService: UserService,
  ) {}

  @UseGuards(AppGuard)
  @Post('/')
  async createClient(
    @Body() requestDto: ClientDto,
    @Headers('Authorization') token: string,
  ): Promise<ApiResponse> {
    const authToken = token.substring(7);
    const authUserResponse = await this.userService.findByUserToken(authToken);
    if (!authUserResponse.success)
      return Helpers.failedHttpResponse(
        authUserResponse.message,
        HttpStatus.UNAUTHORIZED,
      );

    if (!authUserResponse.success)
      return Helpers.fail(authUserResponse.message);

    const response = await this.clientService.createClient(
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
  async updateClient(
    @Body() requestDto: UpdateClientDto,
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

    if (!authUserResponse.success)
      return Helpers.fail(authUserResponse.message);

    const response = await this.clientService.updateClient(
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
  @Put('/status/change/:cuid')
  async blockClient(
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

    if (!authUserResponse.success)
      return Helpers.fail(authUserResponse.message);

    if (!Status[status]) return Helpers.fail('Oops! Status not recognized');

    const response = await this.clientService.updateStatus(
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
  @Get('/detail/:cuid')
  async getClient(
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

    const response = await this.clientService.findByClientId(cuid);
    if (response.success) return response;

    return Helpers.failedHttpResponse(response.message, HttpStatus.BAD_REQUEST);
  }

  @UseGuards(AppGuard)
  @Get('/list')
  async getAllClients(
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
      const clients = await this.clientService.findAllClients(page);
      if (clients.success) return clients;
      return Helpers.failedHttpResponse(
        clients.message,
        HttpStatus.BAD_REQUEST,
      );
    } else {
      return Helpers.failedHttpResponse(
        Messages.NoPermission,
        HttpStatus.UNAUTHORIZED,
      );
    }
  }

  @UseGuards(AppGuard)
  @Get('/search')
  async searchClients(
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
      const clients = await this.clientService.searchClients(page, searchText);
      if (clients.success) return clients;
      return Helpers.failedHttpResponse(
        clients.message,
        HttpStatus.BAD_REQUEST,
      );
    } else {
      return Helpers.failedHttpResponse(
        Messages.NoPermission,
        HttpStatus.UNAUTHORIZED,
      );
    }
  }
}

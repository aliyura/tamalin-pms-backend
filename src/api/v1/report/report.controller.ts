import {
  Controller,
  Get,
  HttpStatus,
  Headers,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiResponse } from 'src/dtos/ApiResponse.dto';
import { UserRole } from 'src/enums';
import { AppGuard } from 'src/services/auth/app.guard';
import { ReportService } from 'src/services/report/report.service';
import { Messages } from 'src/utils/messages/messages';
import { Helpers } from '../../../helpers/utitlity.helpers';
import { UserService } from '../../../services/user/user.service';

@Controller('report')
export class ReportController {
  constructor(
    private reportService: ReportService,
    private userService: UserService,
  ) {}

  @UseGuards(AppGuard)
  @Get('/summary')
  async generateSummaryReport(
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
      const result = await this.reportService.generateSummaryReport();
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

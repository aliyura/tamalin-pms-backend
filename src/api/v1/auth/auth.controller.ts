import { Body, Controller, HttpStatus, Post } from '@nestjs/common';
import { Helpers } from 'src/helpers';
import { AuthService } from '../../../services/auth/auth.service';
import { ApiResponse } from '../../../dtos/ApiResponse.dto';
import { UserAuthDto } from '../../../dtos/user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/login')
  async authenticateUser(
    @Body() requestDto: UserAuthDto,
  ): Promise<ApiResponse> {
    const response = await this.authService.login(requestDto);
    if (response.success) {
      return response;
    }
    return Helpers.failedHttpResponse(
      response.message,
      HttpStatus.UNAUTHORIZED,
    );
  }
}

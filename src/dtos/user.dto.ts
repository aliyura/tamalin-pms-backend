import { IsOptional, IsString } from 'class-validator';

export class UserDto {
  @IsString() name: string;
  @IsString() phoneNumber: string;
  @IsString() nin: string;
  @IsString() password: string;
  @IsString() role: string;
}

export class ResetPasswordDto {
  @IsString() username: string;
  @IsString() newPassword: string;
}

export class AuthUserDto {
  @IsString() username: string;
  @IsString() sub: string;
}

export class UserUpdateDto {
  @IsOptional() name: string;
  @IsOptional() phoneNumber: string;
}

export class UserAuthDto {
  @IsString() username: string;
  @IsString() password: string;
}

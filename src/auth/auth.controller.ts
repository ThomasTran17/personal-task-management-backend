import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Res,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiCookieAuth } from '@nestjs/swagger';
import { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dtos/register.dto';
import { LoginDto } from './dtos/login.dto';
import {
  AuthResponseDto,
  RefreshAccessTokenDto,
} from './dtos/auth-response.dto';
import { LogoutResponseDto } from './dtos/logout-response.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { ApiJsonApiResponse } from '../common/decorators/api-json-api-response.decorator';
import { ApiJsonApiError } from '../common/decorators/api-json-api-error.decorator';
import { Resource } from '../common/decorators/resource.decorator';

@Controller('auth')
@ApiTags('Authentication')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @Resource('auth')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new user' })
  @ApiJsonApiResponse(AuthResponseDto, 'auth', 201, true)
  @ApiJsonApiError(400, 'Email already registered or invalid data')
  @ApiJsonApiError(422, 'Validation error')
  async register(
    @Body() registerDto: RegisterDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<unknown> {
    const { authResponse, cookieOptions, refreshToken } =
      await this.authService.register(registerDto);

    // Set refresh token in HttpOnly cookie
    response.cookie('refreshToken', refreshToken, cookieOptions);

    // Return structure: { data: user (only), accessToken }
    return {
      data: authResponse.user,
      accessToken: authResponse.accessToken,
    };
  }

  @Post('login')
  @Resource('auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login user' })
  @ApiJsonApiResponse(AuthResponseDto, 'auth', 200, true)
  @ApiJsonApiError(401, 'Invalid email or password')
  @ApiJsonApiError(422, 'Validation error')
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<unknown> {
    const { authResponse, cookieOptions, refreshToken } =
      await this.authService.login(loginDto);

    // Set refresh token in HttpOnly cookie
    response.cookie('refreshToken', refreshToken, cookieOptions);

    // Return structure: { data: user (only), accessToken }
    return {
      data: authResponse.user,
      accessToken: authResponse.accessToken,
    };
  }

  @Post('refresh')
  @Resource('auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Refresh access token',
    description:
      'Uses the refresh token stored in HttpOnly cookie to generate a new access token',
  })
  @ApiCookieAuth('refreshToken')
  @ApiJsonApiResponse(RefreshAccessTokenDto, 'auth', 200, true)
  @ApiJsonApiError(401, 'Invalid or missing refresh token')
  async refreshAccessToken(@Req() request: Request): Promise<unknown> {
    const refreshToken = request.cookies['refreshToken'];

    if (!refreshToken) {
      throw new Error('Refresh token not found in cookies');
    }

    const result = await this.authService.refreshAccessToken(refreshToken);

    // Return structure: { data: user (only), accessToken }
    return {
      data: result.user,
      accessToken: result.accessToken,
    };
  }

  @Post('logout')
  @Resource('resource')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Logout user' })
  @ApiCookieAuth('refreshToken')
  @ApiJsonApiResponse(LogoutResponseDto, 'resource', 200, false)
  @ApiJsonApiError(401, 'Unauthorized')
  async logout(
    @Res({ passthrough: true }) response: Response,
  ): Promise<{ message: string }> {
    // Clear refresh token cookie
    response.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
    });

    return { message: 'Logged out successfully' };
  }
}

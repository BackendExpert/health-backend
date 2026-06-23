import { Body, Controller, Get, Headers, Post, Query, UnauthorizedException } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { RequestOTPDTO } from "./dto/request-otp.dto";
import { ClientInfoDecorator } from "src/common/decorators/client-info.decorator";
import type { ClientInfo } from "src/common/interfaces/client-info.interface";
import { VerifyOTPDTO } from "./dto/verify-otp.dto";

@Controller('api/auth')

export class AuthController {
    constructor(
        private readonly authService: AuthService
    ) { }

    @Post('/request-link')
    RequestAuthLink(
        @Body("email") email: string,
        @ClientInfoDecorator() client: ClientInfo,
    ) {
        return this.authService.RequestAuthLink(
            email,
            client.ipAddress,
            client.userAgent
        )
    }

    @Post('/verify-authlink')
    VerifyAuthLink(
        @Query("token") token: string,
        @ClientInfoDecorator() client: ClientInfo,
    ) {
        return this.authService.VerifyAuthLink(
            token,
            client.ipAddress,
            client.userAgent
        )
    }

}
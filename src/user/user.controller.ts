import { Body, Controller, Get, Headers, Param, Patch, Post, UnauthorizedException, UseGuards } from "@nestjs/common";
import { UserService } from "./user.service";
import { JwtAuthGuard } from "src/common/guard/jwt-auth.guard";
import { PermissionsGuard } from "src/common/guard/permissions.guard";
import { Permissions } from "src/common/decorators/permissions.decorator";
import { ClientInfoDecorator } from "src/common/decorators/client-info.decorator";
import type { ClientInfo } from "src/common/interfaces/client-info.interface";
import { CreateUserDto } from "./dtos/create_user.dto";


@Controller('api/user')
export class UserController {
    constructor(
        private readonly userService: UserService
    ) { }

    @Get('users')
    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @Permissions('user:fetch')

    FetchAllUsers(
        @Headers("authorization") authHeader: string,
    ) {
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            throw new UnauthorizedException("Invalid or missing token");
        }

        const token = authHeader.split(" ")[1];

        return this.userService.GetAllusers(
            token
        )
    }

    @Get('users/:id')
    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @Permissions('user:fetch-one')

    FetchUser(
        @Param('id') id: string,
        @Headers("authorization") authHeader: string,
    ) {
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            throw new UnauthorizedException("Invalid or missing token");
        }

        const token = authHeader.split(" ")[1];

        return this.userService.GetUserByID(
            token,
            id
        )
    }

    @Patch(':id')
    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @Permissions('user:update')

    UpdateUserRole(
        @Param('id') id: string,
        @Body('role') role: string,
        @Headers("authorization") authHeader: string,
        @ClientInfoDecorator() client: ClientInfo,
    ) {
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            throw new UnauthorizedException("Invalid or missing token");
        }

        const token = authHeader.split(" ")[1];

        return this.userService.UpdateUserRole(
            token,
            id,
            role,
            client.ipAddress,
            client.userAgent
        )
    }

    @Get('auditlogs')
    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @Permissions('auditlogs:fetch')

    FetchAllAuditLogs(
        @Headers("authorization") authHeader: string,
    ) {
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            throw new UnauthorizedException("Invalid or missing token");
        }

        const token = authHeader.split(" ")[1];

        return this.userService.FetchAllAuditLogs(token)
    }

    @Get('auditlogs/:id')
    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @Permissions('auditlogs:fetch-one')

    FetchAuditLog(
        @Param('id') id: string,
        @Headers("authorization") authHeader: string,
    ) {
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            throw new UnauthorizedException("Invalid or missing token");
        }

        const token = authHeader.split(" ")[1];

        return this.userService.FetchOneAuditLog(token, id)
    }

    @Get('roles')
    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @Permissions('role:fetch')

    FetchRoles(
        @Headers("authorization") authHeader: string,
    ) {
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            throw new UnauthorizedException("Invalid or missing token");
        }

        const token = authHeader.split(" ")[1];

        return this.userService.GetAllRoles(token)
    }

    @Get('role/:id')
    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @Permissions('auditlogs:fetch-one')

    FetchRole(
        @Param('id') id: string,
        @Headers("authorization") authHeader: string,
    ) {
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            throw new UnauthorizedException("Invalid or missing token");
        }

        const token = authHeader.split(" ")[1];

        return this.userService.GetOneRole(token, id)
    }

}
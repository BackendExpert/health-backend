import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import { AuthModule } from "src/auth/auth.module";
import { RoleModule } from "src/role/role.module";

import { User, UserSchema } from "./schema/user.schema";
import { AuditLog, AuditLogSchema } from "src/auditlogs/schema/auditlog.schema";
import { Role, RoleSchema } from "src/role/schema/role.schema";

import { UserController } from "./user.controller";
import { UserService } from "./user.service";
import { EmailService } from "src/common/utils/email.util";

import { JwtModule } from "@nestjs/jwt";

@Module({
    imports: [
        AuthModule,
        RoleModule,

        JwtModule.register({}), 

        MongooseModule.forFeature([
            { name: User.name, schema: UserSchema },
            { name: AuditLog.name, schema: AuditLogSchema },
            { name: Role.name, schema: RoleSchema },
        ])
    ],

    controllers: [UserController],
    providers: [UserService, EmailService],
    exports: [UserService]
})
export class UserModule {}
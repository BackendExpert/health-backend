import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { User, UserDocument } from "./schema/user.schema";
import { Model, Types } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";
import { AuditLog, AuditLogDocument } from "src/auditlogs/schema/auditlog.schema";
import { Role, RoleDocument } from "src/role/schema/role.schema";
import { JwtService } from "@nestjs/jwt";
import { EmailService } from "src/common/utils/email.util";
import { CreateUserDto } from "./dtos/create_user.dto";
import { generateOTP } from "src/common/utils/otp.util";
import bcrypt from 'bcrypt';

import { createAuditLog } from "src/common/utils/auditlogs.util";
import { ConfigService } from "@nestjs/config";


@Injectable()
export class UserService {
    constructor(
        @InjectModel(User.name)
        private readonly userModel: Model<UserDocument>,

        @InjectModel(AuditLog.name)
        private readonly auditlogModel: Model<AuditLogDocument>,

        @InjectModel(Role.name)
        private readonly roleModel: Model<RoleDocument>,

        private readonly jwtService: JwtService,
        private readonly emailService: EmailService,
        private readonly configService: ConfigService,
    ) { }

    async GetAllusers(
        token: string
    ) {
        const payload = await this.jwtService.verify(token)
        const user = await this.userModel.findOne({ email: payload.user })

        if (!user) {
            throw new NotFoundException("The User Not Found")
        }

        const getusers = await this.userModel.find().populate('role')

        return {
            success: true,
            message: "Fetched all Users",
            result: getusers
        }
    }

    async GetUserByID(
        token: string,
        id: string
    ) {
        const payload = await this.jwtService.verify(token)
        const user = await this.userModel.findOne({ email: payload.user })

        if (!user) {
            throw new NotFoundException("The User Not Found")
        }
        if (!Types.ObjectId.isValid(id)) {
            throw new NotFoundException("User Not Found by Given ID");
        }
        const getuser = await this.userModel.findById(id).populate('role')

        if (!getuser) {
            throw new NotFoundException("User Not Found by Given ID")
        }

        return {
            success: true,
            message: "User Fetched Success",
            result: getuser
        }
    }

    async UpdateUserRole(
        token: string,
        id: string,
        role: string,
        ipAddress?: string,
        userAgent?: string
    ) {
        const payload = await this.jwtService.verify(token)
        const user = await this.userModel.findOne({ email: payload.user })

        if (!user) {
            throw new NotFoundException("The User Not Found")
        }

        const checkrole = await this.roleModel.findOne({ role: role })

        if (!checkrole) {
            throw new NotFoundException("The Given Role cannot find")
        }



        const updatedUser = await this.userModel.findByIdAndUpdate(
            id,
            {
                role: checkrole._id
            },
            { new: true }
        );

        if (!updatedUser) {
            throw new NotFoundException("Target user not found");
        }


        await createAuditLog(this.auditlogModel, {
            user: user._id,
            action: "USER_ACCOUNT_UPDATED",
            description: `User Account Role ${updatedUser?.email} Updated by Admin`,
            ipAddress,
            userAgent,
            metadata: { ipAddress, userAgent }
        });

        return {
            success: true,
            message: "User Role Updated Success"
        }
    }

    async FetchAllAuditLogs(
        token: string
    ) {
        const payload = await this.jwtService.verify(token)
        const user = await this.userModel.findOne({ email: payload.user })

        if (!user) {
            throw new NotFoundException("The User Not Found")
        }

        const getauditlogs = await this.auditlogModel.find().populate('user')

        return {
            success: true,
            message: "All AuditLogs Fetched Success",
            result: getauditlogs
        }

    }

    async FetchOneAuditLog(
        token: string,
        id: string
    ) {
        const payload = await this.jwtService.verify(token)
        const user = await this.userModel.findOne({ email: payload.user })

        if (!user) {
            throw new NotFoundException("The User Not Found")
        }

        const fetchauditlog = await this.auditlogModel.findById(id).populate('user')

        return {
            success: true,
            message: "All AuditLogs Fetched Success",
            result: fetchauditlog
        }
    }

    async GetAllRoles(
        token: string
    ) {
        const payload = await this.jwtService.verify(token)
        const user = await this.userModel.findOne({ email: payload.user })

        if (!user) {
            throw new NotFoundException("The User Not Found")
        }

        const getroles = await this.roleModel.find()

        return {
            success: true,
            message: "Roles Fetched Success",
            result: getroles
        }
    }

    async GetOneRole(
        token: string,
        id: string,
    ) {
        const payload = await this.jwtService.verify(token)
        const user = await this.userModel.findOne({ email: payload.user })

        if (!user) {
            throw new NotFoundException("The User Not Found")
        }

        const getrole = await this.roleModel.findById(id)

        return {
            success: true,
            message: "Role Fetched Success",
            result: getrole
        }
    }
}
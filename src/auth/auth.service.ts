import { ConflictException, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { User, UserDocument } from "src/user/schema/user.schema";
import { JwtService } from "@nestjs/jwt";
import { EmailService } from "src/common/utils/email.util";
import { generateOTP } from "src/common/utils/otp.util";
import bcrypt from 'bcrypt';
import { createAuditLog } from "src/common/utils/auditlogs.util";
import { AuditLog, AuditLogDocument } from "src/auditlogs/schema/auditlog.schema";
import { Role, RoleDocument } from "src/role/schema/role.schema";
import { getLocationFromIP } from "../common/utils/location"
import { AuthLink, AuthLinkDocument } from "./schema/authlink.schema";
import { CompareAuthToken, GenerateAuthLink } from "src/common/utils/authlink.util";
import { Patient, PatientDocument } from "src/patient/schema/patient.schema";

@Injectable()
export class AuthService {
    constructor(
        @InjectModel(User.name)
        private userModel: Model<UserDocument>,

        @InjectModel(AuditLog.name)
        private auditlogModel: Model<AuditLogDocument>,

        @InjectModel(Role.name)
        private roleModel: Model<RoleDocument>,

        @InjectModel(AuthLink.name)
        private authlinkModel: Model<AuthLinkDocument>,

        @InjectModel(Patient.name)
        private patientModel: Model<PatientDocument>,

        private jwtService: JwtService,
        private emailService: EmailService,
    ) { }

    async RequestAuthLink(
        email: string,
        ipAddress?: string,
        userAgent?: string,
    ) {
        const checkuser = await this.userModel.findOne({ email: email })

        if (checkuser) {
            if (checkuser.account_stats === false) {
                throw new ConflictException(
                    "Your Account is Deactive now, Contact Admin"
                );
            }
        }


        await this.authlinkModel.deleteMany({
            email,
        });

        const authlink = GenerateAuthLink();

        await this.authlinkModel.create({
            email,
            tokenHash: authlink.tokenHash,
            expiresAt: authlink.expiresAt,
            ipAddress,
            userAgent,
            used: false,
        });

        let user = await this.userModel.findOne({ email });

        const userrole = await this.roleModel.findOne({
            role: "patient",
        });

        if (!userrole) {
            throw new NotFoundException("User role not found");
        }

        const location = getLocationFromIP(ipAddress || "");

        if (!user) {
            const safeIP = String(ipAddress || "0.0.0.0");

            user = await this.userModel.create({
                email,
                role: userrole._id,
                login_ip: safeIP,
                last_login: new Date(),
                account_stats: true,
            });

            await createAuditLog(this.auditlogModel, {
                user: user._id,
                action: "REGISTER_MAGIC_LINK_SENT",
                description: `Registration magic link sent to ${user.email}`,
                ipAddress,
                userAgent,
                metadata: {
                    ipAddress,
                    userAgent,
                    location,
                },
            });
        } else {
            await createAuditLog(this.auditlogModel, {
                user: user._id,
                action: "LOGIN_MAGIC_LINK_SENT",
                description: `Login magic link sent to ${user.email}`,
                ipAddress,
                userAgent,
                metadata: {
                    ipAddress,
                    userAgent,
                    location,
                },
            });
        }

        await this.emailService.sendOTP(
            email,
            authlink.authLink,
            ipAddress,
            userAgent,
        );

        return {
            success: true,
            message: "If the email is valid, a login link has been sent.",
        };
    }

    async VerifyAuthLink(
        token: string,
        ipAddress?: string,
        userAgent?: string,
    ) {
        const authlink = await this.authlinkModel.findOne({
            used: false,
            expiresAt: { $gt: new Date() }
        });

        if (!authlink) {
            throw new ConflictException("Invalid or expired auth link");
        }

        const isValidToken = CompareAuthToken(
            token,
            authlink.tokenHash,
        );

        if (!isValidToken) {
            throw new ConflictException("Invalid or expired auth link");
        }

        const user = await this.userModel
            .findOne({ email: authlink.email })
            .populate("role");

        if (!user) {
            throw new NotFoundException("User not found");
        }

        authlink.used = true;
        await authlink.save();

        user.last_login = new Date();

        if (ipAddress) {
            user.login_ip = ipAddress;
        }

        await user.save();

        const accessToken = await this.jwtService.signAsync({
            sub: user._id,
            email: user.email,
            role: (user.role as any)?.role,
        });

        const location = getLocationFromIP(ipAddress || "");

        await createAuditLog(this.auditlogModel, {
            user: user._id,
            action: "LOGIN_SUCCESS",
            description: "User logged in successfully via magic link",
            ipAddress,
            userAgent,
            metadata: {
                ipAddress,
                userAgent,
                location,
            },
        });

        await this.emailService.NotificationEmail(
            authlink.email,
            "Login Success",
            ipAddress,
            userAgent,
        )


        const userRole = (user.role as any)?.role;

        if (userRole === "patient") {
            const patient = await this.patientModel.findOne({
                user: user._id,
            });

            if (!patient) {
                await this.patientModel.create({
                    user: user._id,
                    join_at: new Date(),
                });
            }
        }

        return {
            success: true,
            accessToken,
            user,
            message: "Login Success"
        };
    }
}
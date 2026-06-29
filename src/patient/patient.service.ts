import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Patient, PatientDocument } from "./schema/patient.schema";
import { Model } from "mongoose";
import { PatientAllergy, PatientAllergyDocument } from "./schema/patient-allergy.schema";
import { PatientHistory, PatientHistoryDocument } from "./schema/patient-history.schema";
import { User, UserDocument } from "src/user/schema/user.schema";
import { AuditLog, AuditLogDocument } from "src/auditlogs/schema/auditlog.schema";
import { JwtService } from "@nestjs/jwt";
import { EmailService } from "src/common/utils/email.util";
import { UpdatePatientInfoDto } from "./dto/UpdatePatientDataDTO";
import { createAuditLog } from "src/common/utils/auditlogs.util";

@Injectable()
export class PatientService {
    constructor(
        @InjectModel(Patient.name)
        private patientModel: Model<PatientDocument>,

        @InjectModel(PatientAllergy.name)
        private patientallergyModel: Model<PatientAllergyDocument>,

        @InjectModel(PatientHistory.name)
        private patienthistoryModel: Model<PatientHistoryDocument>,

        @InjectModel(User.name)
        private userModel: Model<UserDocument>,

        @InjectModel(AuditLog.name)
        private auditlogModel: Model<AuditLogDocument>,

        private jwtService: JwtService,
        private emailService: EmailService,
    ) { }

    async GetMyData(
        token: string,
    ) {
        const payload = await this.jwtService.verify(token);
        const user = await this.userModel.findOne({
            email: payload.user,
        });

        if (!user) {
            throw new NotFoundException("The User Not Found");
        }

        const patient = await this.patientModel.findOne({ user: user._id })

        return {
            success: true,
            result: patient
        }
    }

    async UpdatePatientInfo(
        token: string,
        dto: UpdatePatientInfoDto,
        ipAddress?: string,
        userAgent?: string,
    ) {
        const payload = await this.jwtService.verify(token);
        const user = await this.userModel.findOne({
            email: payload.user,
        });

        if (!user) {
            throw new NotFoundException("The User Not Found");
        }

        const updateData: any = {};

        if (dto.nic !== undefined) updateData.nic = dto.nic;
        if (dto.fname !== undefined) updateData.fname = dto.fname;
        if (dto.mname !== undefined) updateData.mname = dto.mname;
        if (dto.lname !== undefined) updateData.lname = dto.lname;
        if (dto.address !== undefined) updateData.address = dto.address;
        if (dto.mobile !== undefined) updateData.mobile = dto.mobile;
        if (dto.gender !== undefined) updateData.gender = dto.gender;
        if (dto.dob !== undefined) updateData.dob = dto.dob;

        const updatePatient = await this.patientModel.findOneAndUpdate(
            { user: user._id },
            { $set: updateData },
            { new: true }
        );

        if (!updatePatient) {
            throw new NotFoundException("Patient record not found");
        }

        await createAuditLog(this.auditlogModel, {
            user: user._id,
            action: "USER_ACCOUNT_STATUS_UPDATED",
            description: `User Account Status ${user?.email} Updated by Admin`,
            ipAddress,
            userAgent,
            metadata: { ipAddress, userAgent }
        });

        return {
            success: true,
            message: "Patient Data Update Success"
        }
    }

    async FetchAllPatients(
        token: string
    ) {
        const payload = await this.jwtService.verify(token);
        const user = await this.userModel.findOne({
            email: payload.user,
        });

        if (!user) {
            throw new NotFoundException("The User Not Found");
        }

        const patients = await this.patientModel.find()

        return {
            success: true,
            result: patients
        }
    }

    async FetchPatientByID(
        id: string,
        token: string
    ) {
        const payload = await this.jwtService.verify(token);
        const user = await this.userModel.findOne({
            email: payload.user,
        });

        if (!user) {
            throw new NotFoundException("The User Not Found");
        }

        const patient = await this.patientModel.findById(id)

        if(!patient) {
            throw new NotFoundException("Patient Not Found")
        }

        return {
            success: true,
            result: patient
        }
    }
}
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Patient, PatientDocument } from "./schema/patient.schema";
import { Model } from "mongoose";
import { PatientAllergy, PatientAllergyDocument } from "./schema/patient-allergy.schema";
import { PatientHistory, PatientHistoryDocument } from "./schema/patient-history.schema";
import { User, UserDocument } from "src/user/schema/user.schema";
import { AuditLog, AuditLogDocument } from "src/auditlogs/schema/auditlog.schema";
import { JwtService } from "@nestjs/jwt";
import { EmailService } from "src/common/utils/email.util";

@Injectable()
export class PatientService {
    constructor (
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
    ) {}

    
}
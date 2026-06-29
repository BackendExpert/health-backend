import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AuditLog, AuditLogSchema } from "src/auditlogs/schema/auditlog.schema";
import { AuthModule } from "src/auth/auth.module";
import { RoleModule } from "src/role/role.module";
import { User, UserSchema } from "src/user/schema/user.schema";
import { Patient, PatientSchema } from "./schema/patient.schema";
import { PatientAllergy, PatientAllergySchema } from "./schema/patient-allergy.schema";
import { PatientHistory, PatientHistorySchema } from "./schema/patient-history.schema";
import { PatientController } from "./patient.controller";
import { PatientService } from "./patient.service";
import { EmailService } from "src/common/utils/email.util";

@Module({
    imports: [
        AuthModule,
        RoleModule,
        MongooseModule.forFeature([
            { name: User.name, schema: UserSchema },
            { name: AuditLog.name, schema: AuditLogSchema },
            { name: Patient.name, schema: PatientSchema },
            { name: PatientAllergy.name, schema: PatientAllergySchema },
            { name: PatientHistory.name, schema: PatientHistorySchema }
        ])
    ],
    controllers: [PatientController],
    providers: [PatientService, EmailService],
    exports: [PatientService]
})

export class PatientModule { }
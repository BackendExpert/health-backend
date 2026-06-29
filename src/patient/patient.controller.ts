import { Body, Controller, Get, Headers, Param, Patch, UnauthorizedException, UseGuards } from "@nestjs/common";
import { PatientService } from "./patient.service";
import { JwtAuthGuard } from "src/common/guard/jwt-auth.guard";
import { PermissionsGuard } from "src/common/guard/permissions.guard";
import { Permissions } from "src/common/decorators/permissions.decorator";
import { ClientInfoDecorator } from "src/common/decorators/client-info.decorator";
import type { ClientInfo } from "src/common/interfaces/client-info.interface";
import { UpdatePatientInfoDto } from "./dto/UpdatePatientDataDTO";

@Controller('api/patient')
export class PatientController {
    constructor(
        private readonly patientService: PatientService
    ) { }

    @Get('/my-data')
    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @Permissions("patient:my-data")
    GetPatientData(
        @Headers("authorization") authHeader: string,
    ) {
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            throw new UnauthorizedException("Invalid or missing token");
        }

        const token = authHeader.split(" ")[1];

        return this.patientService.GetMyData(token)
    }


    @Patch('/update-patient-data')
    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @Permissions("patient:update-data")

    UpdatePatientData(
        @Headers("authorization") authHeader: string,
        @ClientInfoDecorator() client: ClientInfo,
        @Body() dto: UpdatePatientInfoDto
    ) {
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            throw new UnauthorizedException("Invalid or missing token");
        }

        const token = authHeader.split(" ")[1];

        return this.patientService.UpdatePatientInfo(
            token,
            dto,
            client.ipAddress,
            client.userAgent
        )
    }

    @Get('/fetch-patients')
    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @Permissions("patient:fetch-all")

    FetchAllPatients(
        @Headers("authorization") authHeader: string,
    ) {
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            throw new UnauthorizedException("Invalid or missing token");
        }

        const token = authHeader.split(" ")[1];

        return this.patientService.FetchAllPatients(token)
    }

    @Get('/fetch-patient/:id')
    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @Permissions("patient:fetch-by-id")

    FetchPatientByid(
        @Headers("authorization") authHeader: string,
        @Param('id') id: string,
    ) {
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            throw new UnauthorizedException("Invalid or missing token");
        }

        const token = authHeader.split(" ")[1];

        return this.patientService.FetchPatientByID(id, token)
    }
}
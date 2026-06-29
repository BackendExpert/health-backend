import { IsString } from "class-validator";

export class UpdatePatientInfoDto {
    @IsString()
    nic!: string;

    @IsString()
    fname!: string

    @IsString()
    mname!: string

    @IsString()
    lname!: string

    @IsString()
    address!: string

    @IsString()
    mobile!: string

    @IsString()
    gender!: string

    @IsString()
    dob!: Date
}
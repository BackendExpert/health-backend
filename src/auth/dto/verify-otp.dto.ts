import { IsString, Length } from "class-validator";

export class VerifyOTPDTO {
    @IsString()
    @Length(8)
    otp!: string;
}
import { IsEmail } from "class-validator";

export class RequestOTPDTO {
    @IsEmail()
    email!: string;
}
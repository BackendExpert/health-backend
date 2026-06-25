import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export type PatientAllergyDocument = PatientAllergy & Document

@Schema({ timestamps: true })

export class PatientAllergy {
    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    user!: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'Medicine', required: true })
    medicine!: Types.ObjectId;

    @Prop({ required: true, type: String })
    desc!: string
}

export const PatientAllergySchema = SchemaFactory.createForClass(PatientAllergy);
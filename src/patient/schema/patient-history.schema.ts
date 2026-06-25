import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export type PatientHistoryDocument = PatientHistory & Document

@Schema({ timestamps: true })

export class PatientHistory {
    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    user!: Types.ObjectId;

    @Prop({ required: true, type: String })
    desc!: string

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    doctor!: Types.ObjectId;
}

export const PatientHistorySchema = SchemaFactory.createForClass(PatientHistory);
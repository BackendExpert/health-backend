import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export type PatientDocument = Patient & Document

@Schema({ timestamps: true })

export class Patient {
    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    user!: Types.ObjectId;

    @Prop({ type: String })
    nic!: string

    @Prop({ type: String })
    fname!: string

    @Prop({ type: String })
    mname!: string

    @Prop({ type: String })
    lname!: string

    @Prop({ type: String })
    address!: string

    @Prop({type: String })
    mobile!: string

    @Prop({ required: true, default: new Date() })
    join_at!: Date

    @Prop({})
    dob!: Date
}

export const PatientSchema = SchemaFactory.createForClass(Patient);
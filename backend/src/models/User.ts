import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcrypt';

export interface IUser extends Document {
    email: string;
    password?: string;
    name: string;
    googleId?: string;
    role: 'FOUNDER' | 'ADMIN' | 'GUEST';
    comparePassword(candidatePassword: string): Promise<boolean>;
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema: Schema = new Schema(
    {
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
        },
        password: {
            type: String,
            required: false, // Could be optional for OAuth users later
        },
        name: {
            type: String,
            required: true,
        },
        googleId: {
            type: String,
            required: false,
        },
        role: {
            type: String,
            enum: ['FOUNDER', 'ADMIN', 'GUEST'],
            default: 'FOUNDER',
        },
    },
    { timestamps: true }
);

// Hash the password before saving
UserSchema.pre<IUser>('save', async function (next) {
    if (!this.isModified('password') || !this.password) {
        return next();
    }

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error: any) {
        next(error);
    }
});

UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
    if (!this.password) return false;
    return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model<IUser>('User', UserSchema);

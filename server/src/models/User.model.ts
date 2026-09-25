import { Schema, model, Document, Types } from 'mongoose';

export type UserRole = 'resident' | 'moderator' | 'admin';

export interface IUser extends Document {
  _id: Types.ObjectId;
  email: string;
  passwordHash: string;
  role: UserRole;
  municipality: string;
  createdAt: Date;
  updatedAt: Date;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: [true, 'USER_EMAIL_REQUIRED'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [EMAIL_REGEX, 'USER_EMAIL_INVALID'],
    },
    passwordHash: {
      type: String,
      required: [true, 'USER_PASSWORD_HASH_REQUIRED'],
    },
    role: {
      type: String,
      enum: {
        values: ['resident', 'moderator', 'admin'],
        message: 'USER_ROLE_INVALID',
      },
      default: 'resident',
    },
    municipality: {
      type: String,
      required: [true, 'USER_MUNICIPALITY_REQUIRED'],
      trim: true,
    },
  },
  { timestamps: true },
);


userSchema.set('toJSON', {
  transform: (_doc, ret) => {
    const { passwordHash: _passwordHash, ...safe } = ret as unknown as Record<string, unknown>;
    return safe;
  },
});

export const User = model<IUser>('User', userSchema);

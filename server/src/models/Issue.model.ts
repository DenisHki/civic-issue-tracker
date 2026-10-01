import { Schema, model, Document, Types } from 'mongoose';

export type IssueCategory = 'pothole' | 'streetlight' | 'graffiti' | 'waste' | 'other';
export type IssueStatus = 'reported' | 'in_progress' | 'resolved';

export interface IIssue extends Document {
  _id: Types.ObjectId;
  title: string;
  description: string;
  category: IssueCategory;
  status: IssueStatus;
  location: {
    lat: number;
    lng: number;
  };
  municipality: string;
  reportedBy: Types.ObjectId;
  upvoteCount: number;
  upvotedBy: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const issueSchema = new Schema<IIssue>(
  {
    title: {
      type: String,
      required: [true, 'ISSUE_TITLE_REQUIRED'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'ISSUE_DESCRIPTION_REQUIRED'],
      trim: true,
    },
    category: {
      type: String,
      enum: {
        values: ['pothole', 'streetlight', 'graffiti', 'waste', 'other'],
        message: 'ISSUE_CATEGORY_INVALID',
      },
      required: [true, 'ISSUE_CATEGORY_REQUIRED'],
    },
    status: {
      type: String,
      enum: {
        values: ['reported', 'in_progress', 'resolved'],
        message: 'ISSUE_STATUS_INVALID',
      },
      default: 'reported',
    },
    location: {
      lat: { type: Number, required: [true, 'ISSUE_LOCATION_LAT_REQUIRED'] },
      lng: { type: Number, required: [true, 'ISSUE_LOCATION_LNG_REQUIRED'] },
    },
    municipality: {
      type: String,
      required: [true, 'ISSUE_MUNICIPALITY_REQUIRED'],
      trim: true,
    },
    reportedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'ISSUE_REPORTED_BY_REQUIRED'],
    },
    upvoteCount: {
      type: Number,
      default: 0,
    },
    upvotedBy: {
      type: [Schema.Types.ObjectId],
      ref: 'User',
      default: [],
    },
  },
  { timestamps: true },
);

export const Issue = model<IIssue>('Issue', issueSchema);

import { Schema, model, Document, Types } from 'mongoose';

export interface IComment extends Document {
  _id: Types.ObjectId;
  issue: Types.ObjectId;
  author: Types.ObjectId;
  text: string;
  createdAt: Date;
  updatedAt: Date;
}

const commentSchema = new Schema<IComment>(
  {
    issue: {
      type: Schema.Types.ObjectId,
      ref: 'Issue',
      required: [true, 'COMMENT_ISSUE_REQUIRED'],
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'COMMENT_AUTHOR_REQUIRED'],
    },
    text: {
      type: String,
      required: [true, 'COMMENT_TEXT_REQUIRED'],
      trim: true,
    },
  },
  { timestamps: true },
);

export const Comment = model<IComment>('Comment', commentSchema);

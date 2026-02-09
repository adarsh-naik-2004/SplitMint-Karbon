import mongoose from 'mongoose';

const splitLineSchema = new mongoose.Schema(
  {
    participantId: { type: String, required: true },
    amount: { type: Number, required: true }
  },
  { _id: false }
);

const expenseSchema = new mongoose.Schema(
  {
    groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    description: { type: String, required: true },
    amount: { type: Number, required: true, min: 0 },
    date: { type: Date, required: true },
    payerId: { type: String, required: true },
    splitMode: {
      type: String,
      enum: ['equal', 'custom', 'percentage'],
      default: 'equal'
    },
    splits: { type: [splitLineSchema], required: true },
    category: { type: String }
  },
  { timestamps: true }
);

export default mongoose.model('Expense', expenseSchema);

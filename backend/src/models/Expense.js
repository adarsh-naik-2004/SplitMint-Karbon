import mongoose from 'mongoose';

const splitLineSchema = new mongoose.Schema(
  {
    participantId: {
      type: String,
      required: [true, 'Participant ID is required']
    },
    amount: {
      type: Number,
      required: [true, 'Split amount is required'],
      min: [0, 'Split amount cannot be negative']
    }
  },
  { _id: false }
);

const expenseSchema = new mongoose.Schema(
  {
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Group',
      required: [true, 'Group ID is required'],
      index: true
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Owner ID is required'],
      index: true
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      minlength: [1, 'Description must be at least 1 character'],
      maxlength: [200, 'Description cannot exceed 200 characters']
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0.01, 'Amount must be at least 0.01'],
      max: [1000000, 'Amount cannot exceed 1,000,000']
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
      index: true
    },
    payerId: {
      type: String,
      required: [true, 'Payer ID is required']
    },
    splitMode: {
      type: String,
      enum: {
        values: ['equal', 'custom', 'percentage'],
        message: 'Split mode must be equal, custom, or percentage'
      },
      default: 'equal'
    },
    splits: {
      type: [splitLineSchema],
      required: [true, 'Splits are required'],
      validate: {
        validator: function (v) {
          return v.length > 0;
        },
        message: 'At least one split is required'
      }
    },
    category: {
      type: String,
      enum: ['food', 'transport', 'entertainment', 'utilities', 'shopping', 'healthcare', 'other', 'uncategorized'],
      default: 'uncategorized'
    },
    notes: {
      type: String,
      maxlength: [500, 'Notes cannot exceed 500 characters']
    },
    isDeleted: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

// Compound indexes for common queries
expenseSchema.index({ ownerId: 1, groupId: 1, date: -1 });
expenseSchema.index({ ownerId: 1, isDeleted: 1, createdAt: -1 });
expenseSchema.index({ 'splits.participantId': 1 });

// Validate that split amounts sum to total amount
expenseSchema.pre('save', function (next) {
  const totalSplits = this.splits.reduce((sum, split) => sum + split.amount, 0);
  const roundedTotal = Math.round(this.amount * 100) / 100;
  const roundedSplits = Math.round(totalSplits * 100) / 100;

  if (Math.abs(roundedTotal - roundedSplits) > 0.01) {
    return next(new Error(`Split amounts (${roundedSplits}) must equal total amount (${roundedTotal})`));
  }
  next();
});

// Virtual for formatted amount
expenseSchema.virtual('formattedAmount').get(function () {
  return `$${this.amount.toFixed(2)}`;
});

// Method to check if expense belongs to user
expenseSchema.methods.belongsTo = function (userId) {
  return this.ownerId.toString() === userId.toString();
};

// Method to get participants involved in expense
expenseSchema.methods.getParticipantIds = function () {
  return [...new Set([this.payerId, ...this.splits.map((s) => s.participantId)])];
};

expenseSchema.set('toJSON', { virtuals: true });

export default mongoose.model('Expense', expenseSchema);
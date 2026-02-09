import mongoose from 'mongoose';

const participantSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Participant name is required'],
      trim: true,
      minlength: [1, 'Name must be at least 1 character'],
      maxlength: [50, 'Name cannot exceed 50 characters']
    },
    color: {
      type: String,
      default: '#6b7280',
      match: [/^#[0-9A-F]{6}$/i, 'Color must be a valid hex code']
    },
    avatar: {
      type: String,
      default: 'default'
    },
    isOwner: {
      type: Boolean,
      default: false
    }
  },
  { _id: true }
);

const groupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Group name is required'],
      trim: true,
      minlength: [1, 'Group name must be at least 1 character'],
      maxlength: [100, 'Group name cannot exceed 100 characters']
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    participants: {
      type: [participantSchema],
      validate: {
        validator: function (v) {
          return v.length >= 1 && v.length <= 4;
        },
        message: 'A group must have 1-4 participants (including owner)'
      }
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

// Compound index for faster queries
groupSchema.index({ ownerId: 1, isActive: 1 });

// Ensure owner is always first participant
groupSchema.pre('save', function (next) {
  if (this.participants.length > 0) {
    const ownerIndex = this.participants.findIndex((p) => p.isOwner);
    if (ownerIndex > 0) {
      const owner = this.participants.splice(ownerIndex, 1)[0];
      this.participants.unshift(owner);
    }
  }
  next();
});

// Virtual for participant count
groupSchema.virtual('participantCount').get(function () {
  return this.participants.length;
});

// Method to get participant by ID
groupSchema.methods.getParticipant = function (participantId) {
  return this.participants.id(participantId);
};

// Method to check if user is owner
groupSchema.methods.isOwnedBy = function (userId) {
  return this.ownerId.toString() === userId.toString();
};

groupSchema.set('toJSON', { virtuals: true });

export default mongoose.model('Group', groupSchema);
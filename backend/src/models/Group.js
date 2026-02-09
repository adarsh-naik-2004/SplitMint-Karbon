import mongoose from 'mongoose';

const participantSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    color: { type: String },
    avatar: { type: String }
  },
  { _id: true }
);

const groupSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    participants: {
      type: [participantSchema],
      validate: [(v) => v.length <= 4, 'A group can have up to 4 total members']
    }
  },
  { timestamps: true }
);

export default mongoose.model('Group', groupSchema);

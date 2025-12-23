import mongoose from 'mongoose';

const loanSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  interest: {
    type: Number,
    required: true
  },
  maxLimit: {
    type: Number,
    required: true
  },
  requiredDocuments: {
    type: [String],
    default: []
  },
  emiPlans: {
    type: [String],
    default: []
  },
  images: {
    type: [String],
    default: []
  },
  showOnHome: {
    type: Boolean,
    default: false
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdByEmail: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

export default mongoose.model('Loan', loanSchema);
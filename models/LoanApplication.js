import mongoose from 'mongoose';

const loanApplicationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userEmail: {
    type: String,
    required: true
  },
  loanId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Loan',
    required: true
  },
  loanTitle: {
    type: String,
    required: true
  },
  interestRate: {
    type: Number,
    required: true
  },
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  contactNumber: {
    type: String,
    required: true
  },
  nationalId: {
    type: String,
    required: true
  },
  incomeSource: {
    type: String,
    required: true
  },
  monthlyIncome: {
    type: Number,
    required: true
  },
  loanAmount: {
    type: Number,
    required: true
  },
  reason: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  notes: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending'
  },
  applicationFeeStatus: {
    type: String,
    enum: ['Unpaid', 'Paid'],
    default: 'Unpaid'
  },
  paymentDetails: {
    transactionId: String,
    amount: Number,
    paidAt: Date
  },
  approvedAt: {
    type: Date
  },
  rejectedAt: {
    type: Date
  }
}, {
  timestamps: true
});

export default mongoose.model('LoanApplication', loanApplicationSchema);
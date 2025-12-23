import express from 'express';
import Stripe from 'stripe';
import LoanApplication from '../models/LoanApplication.js';
import { authenticate } from '../middleware/auth.js';
import { checkRole } from '../middleware/roleCheck.js';

const router = express.Router();

// Initialize Stripe only if API key is provided
let stripe;
if (process.env.STRIPE_SECRET_KEY) {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
} else {
  console.warn('Warning: STRIPE_SECRET_KEY not found in environment variables. Payment features will be disabled.');
}

// Create loan application
router.post('/', authenticate, checkRole('borrower'), async (req, res) => {
  try {
    const application = await LoanApplication.create({
      ...req.body,
      userId: req.user._id,
      userEmail: req.user.email
    });

    res.status(201).json({ success: true, application });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all applications (Admin/Manager)
router.get('/', authenticate, checkRole('admin', 'manager'), async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    let query = {};
    if (status) {
      query.status = status;
    }

    const applications = await LoanApplication.find(query)
      .populate('userId', 'name email photoURL')
      .populate('loanId', 'title category')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const count = await LoanApplication.countDocuments(query);

    res.json({
      success: true,
      applications,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user's applications
router.get('/my-applications', authenticate, checkRole('borrower'), async (req, res) => {
  try {
    const applications = await LoanApplication.find({ userId: req.user._id })
      .populate('loanId', 'title category interest')
      .sort({ createdAt: -1 });

    res.json({ success: true, applications });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single application
router.get('/:id', authenticate, async (req, res) => {
  try {
    const application = await LoanApplication.findById(req.params.id)
      .populate('userId', 'name email photoURL')
      .populate('loanId', 'title category interest');

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Check authorization
    if (req.user.role === 'borrower' && application.userId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json({ success: true, application });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Approve application (Manager/Admin)
router.patch('/:id/approve', authenticate, checkRole('manager', 'admin'), async (req, res) => {
  try {
    const application = await LoanApplication.findByIdAndUpdate(
      req.params.id,
      { status: 'Approved', approvedAt: new Date() },
      { new: true }
    );

    res.json({ success: true, application });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Reject application (Manager/Admin)
router.patch('/:id/reject', authenticate, checkRole('manager', 'admin'), async (req, res) => {
  try {
    const application = await LoanApplication.findByIdAndUpdate(
      req.params.id,
      { status: 'Rejected', rejectedAt: new Date() },
      { new: true }
    );

    res.json({ success: true, application });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Cancel application (Borrower)
router.delete('/:id', authenticate, checkRole('borrower'), async (req, res) => {
  try {
    const application = await LoanApplication.findById(req.params.id);

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    if (application.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (application.status !== 'Pending') {
      return res.status(400).json({ message: 'Can only cancel pending applications' });
    }

    await LoanApplication.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: 'Application cancelled successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create payment intent
router.post('/create-payment-intent', authenticate, async (req, res) => {
  try {
    if (!stripe) {
      return res.status(500).json({ message: 'Payment service is not configured. Please contact administrator.' });
    }

    const { applicationId } = req.body;

    const application = await LoanApplication.findById(applicationId);

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    if (application.applicationFeeStatus === 'Paid') {
      return res.status(400).json({ message: 'Application fee already paid' });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: 1000, // $10 in cents
      currency: 'usd',
      metadata: {
        applicationId: applicationId,
        userEmail: req.user.email
      }
    });

    res.json({
      success: true,
      clientSecret: paymentIntent.client_secret
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Confirm payment
router.post('/confirm-payment', authenticate, async (req, res) => {
  try {
    if (!stripe) {
      return res.status(500).json({ message: 'Payment service is not configured. Please contact administrator.' });
    }

    const { applicationId, paymentIntentId } = req.body;

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status === 'succeeded') {
      const application = await LoanApplication.findByIdAndUpdate(
        applicationId,
        {
          applicationFeeStatus: 'Paid',
          paymentDetails: {
            transactionId: paymentIntentId,
            amount: 10,
            paidAt: new Date()
          }
        },
        { new: true }
      );

      res.json({ success: true, application });
    } else {
      res.status(400).json({ message: 'Payment not successful' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
import express from 'express';
import Loan from '../models/Loan.js';
import { authenticate } from '../middleware/auth.js';
import { checkRole } from '../middleware/roleCheck.js';

const router = express.Router();

// Get all loans (public)
router.get('/', async (req, res) => {
  try {
    const { search, page = 1, limit = 10, category } = req.query;
    
    let query = {};
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } }
      ];
    }
    if (category) {
      query.category = category;
    }

    const loans = await Loan.find(query)
      .populate('createdBy', 'name email')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const count = await Loan.countDocuments(query);

    res.json({
      success: true,
      loans,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get featured loans for home page
router.get('/featured', async (req, res) => {
  try {
    const loans = await Loan.find({ showOnHome: true })
      .limit(6)
      .sort({ createdAt: -1 });

    res.json({ success: true, loans });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single loan
router.get('/:id', async (req, res) => {
  try {
    const loan = await Loan.findById(req.params.id)
      .populate('createdBy', 'name email');

    if (!loan) {
      return res.status(404).json({ message: 'Loan not found' });
    }

    res.json({ success: true, loan });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create loan (Manager only)
router.post('/', authenticate, checkRole('manager', 'admin'), async (req, res) => {
  try {
    const loan = await Loan.create({
      ...req.body,
      createdBy: req.user._id,
      createdByEmail: req.user.email
    });

    res.status(201).json({ success: true, loan });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update loan
router.put('/:id', authenticate, checkRole('manager', 'admin'), async (req, res) => {
  try {
    const loan = await Loan.findById(req.params.id);

    if (!loan) {
      return res.status(404).json({ message: 'Loan not found' });
    }

    if (req.user.role === 'manager' && loan.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this loan' });
    }

    const updatedLoan = await Loan.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json({ success: true, loan: updatedLoan });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete loan
router.delete('/:id', authenticate, checkRole('manager', 'admin'), async (req, res) => {
  try {
    const loan = await Loan.findById(req.params.id);

    if (!loan) {
      return res.status(404).json({ message: 'Loan not found' });
    }

    if (req.user.role === 'manager' && loan.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this loan' });
    }

    await Loan.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: 'Loan deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get loans by manager
router.get('/manager/my-loans', authenticate, checkRole('manager'), async (req, res) => {
  try {
    const { search } = req.query;
    let query = { createdBy: req.user._id };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } }
      ];
      query.createdBy = req.user._id;
    }

    const loans = await Loan.find(query).sort({ createdAt: -1 });

    res.json({ success: true, loans });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Toggle show on home
router.patch('/:id/toggle-home', authenticate, checkRole('admin'), async (req, res) => {
  try {
    const loan = await Loan.findById(req.params.id);
    loan.showOnHome = !loan.showOnHome;
    await loan.save();

    res.json({ success: true, loan });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
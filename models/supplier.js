import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

const supplierSchema = new mongoose.Schema({
  supplierName: {
    type: String,
    required: [true, 'Supplier name is required'],
    trim: true,
    maxlength: [50, 'Supplier name cannot be more than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please enter a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
    maxlength: [15, 'Phone number cannot be more than 15 characters']
  },
  businessAddress: {
    type: String,
    required: [true, 'Business address is required'],
    trim: true,
    maxlength: [200, 'Business address cannot be more than 200 characters']
  },
  businessType: {
    type: String,
    required: [true, 'Business type is required'],
    trim: true,
    maxlength: [100, 'Business type cannot be more than 100 characters']
  },
  supplierID: {
    type: String,
    unique: true
  },
  profilePicture: {
    type: String,
    default: '',
    validate: {
      validator: function(v) {
        return !v || /^https?:\/\/.+\.(jpg|jpeg|png|gif)$/i.test(v);
      },
      message: 'Profile picture must be a valid image URL'
    }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Hash password before saving
supplierSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Generate supplierID before saving
supplierSchema.pre('save', async function(next) {
  if (!this.supplierID) {
    const count = await mongoose.models.Supplier.countDocuments();
    this.supplierID = `SUP${String(count + 1001).padStart(4, '0')}`;
  }
  next();
});

// Compare password method
supplierSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password) {
    return false;
  }
  return await bcrypt.compare(candidatePassword, this.password);
};

// Transform output
supplierSchema.methods.toJSON = function() {
  const supplier = this.toObject();
  delete supplier.password;
  return supplier;
};

const Supplier = mongoose.models.Supplier || mongoose.model('Supplier', supplierSchema);

export default Supplier;

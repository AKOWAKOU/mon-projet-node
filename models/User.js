const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

class UserModel {
  constructor() {
    this.schema = new mongoose.Schema({
      username: {
        type: String,
        required: [true, 'Username is required'],
        unique: true,
        trim: true,
        minlength: [3, 'Username must be at least 3 characters'],
        maxlength: [30, 'Username cannot exceed 30 characters']
      },
      email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
      },
      password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters']
      },
      isEmailConfirmed: {
        type: Boolean,
        default: false
      },
      emailConfirmationToken: {
        type: String,
        default: null
      },
      passwordResetToken: {
        type: String,
        default: null
      },
      passwordResetExpires: {
        type: Date,
        default: null
      },
      role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
      },
      profilePicture: {
        type: String,
        default: null
      },
      createdAt: {
        type: Date,
        default: Date.now
      },
      updatedAt: {
        type: Date,
        default: Date.now
      }
    });

    // Indexes
    this.schema.index({ email: 1 });
    this.schema.index({ username: 1 });
    this.schema.index({ emailConfirmationToken: 1 });
    this.schema.index({ passwordResetToken: 1 });

    // Pre-save middleware to hash password
    this.schema.pre('save', async function(next) {
      if (!this.isModified('password')) return next();
      
      try {
        const salt = await bcrypt.genSalt(12);
        this.password = await bcrypt.hash(this.password, salt);
        next();
      } catch (error) {
        next(error);
      }
    });

    // Update timestamp on save
    this.schema.pre('save', function(next) {
      this.updatedAt = Date.now();
      next();
    });

    // Instance methods
    this.schema.methods.comparePassword = async function(candidatePassword) {
      try {
        return await bcrypt.compare(candidatePassword, this.password);
      } catch (error) {
        throw new Error('Error comparing passwords');
      }
    };

    this.schema.methods.generateEmailConfirmationToken = function() {
      const token = require('crypto').randomBytes(32).toString('hex');
      this.emailConfirmationToken = token;
      return token;
    };

    this.schema.methods.generatePasswordResetToken = function() {
      const token = require('crypto').randomBytes(32).toString('hex');
      this.passwordResetToken = token;
      this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
      return token;
    };

    this.schema.methods.toJSON = function() {
      const user = this.toObject();
      delete user.password;
      delete user.emailConfirmationToken;
      delete user.passwordResetToken;
      delete user.passwordResetExpires;
      return user;
    };

    // Static methods
    this.schema.statics.findByEmailOrUsername = function(identifier) {
      return this.findOne({
        $or: [
          { email: identifier.toLowerCase() },
          { username: identifier }
        ]
      });
    };

    this.model = mongoose.model('User', this.schema);
  }

  getModel() {
    return this.model;
  }
}

module.exports = new UserModel().getModel();
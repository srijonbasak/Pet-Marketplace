const mongoose = require('mongoose');

const rescueSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  ngo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['planning', 'in_progress', 'completed', 'cancelled'],
    default: 'planning',
    required: true
  },
  location: {
    address: String,
    city: {
      type: String,
      required: true
    },
    state: {
      type: String,
      required: true
    },
    country: {
      type: String,
      required: true
    },
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  description: {
    type: String,
    required: true
  },
  rescueDate: {
    planned: {
      type: Date,
      required: true
    },
    actual: Date
  },
  // Rescued animals information
  animals: [{
    species: {
      type: String,
      required: true
    },
    breed: String,
    count: {
      type: Number,
      default: 1,
      required: true
    },
    condition: {
      type: String,
      enum: ['critical', 'poor', 'fair', 'good', 'unknown'],
      default: 'unknown'
    },
    notes: String,
    images: [String]
  }],
  // Team members participating in the rescue
  team: [{
    member: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: {
      type: String,
      required: true
    }
  }],
  // Resources needed for the rescue
  resources: {
    vehiclesNeeded: {
      type: Number,
      default: 1
    },
    medicalSupplies: {
      type: Boolean,
      default: false
    },
    foodSupplies: {
      type: Boolean,
      default: false
    },
    cages: {
      type: Number,
      default: 0
    },
    volunteers: {
      type: Number,
      default: 1
    },
    veterinarian: {
      type: Boolean,
      default: false
    },
    estimatedCost: {
      type: Number
    },
    otherResources: [String]
  },
  // Financial tracking
  funding: {
    required: {
      type: Number,
      default: 0
    },
    raised: {
      type: Number,
      default: 0
    },
    donations: [{
      donor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      anonymousDonor: {
        name: String,
        email: String
      },
      amount: {
        type: Number,
        required: true
      },
      date: {
        type: Date,
        default: Date.now
      },
      message: String
    }]
  },
  // Updates during and after the rescue
  updates: [{
    content: {
      type: String,
      required: true
    },
    date: {
      type: Date,
      default: Date.now
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    images: [String]
  }],
  // Outcomes and results
  outcomes: {
    animalsRescued: {
      type: Number
    },
    animalsRehabilitated: {
      type: Number
    },
    animalsAdopted: {
      type: Number
    },
    success: {
      type: Boolean
    },
    challenges: [String],
    summary: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Rescue = mongoose.model('Rescue', rescueSchema);

module.exports = Rescue; 
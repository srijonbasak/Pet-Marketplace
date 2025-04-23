const mongoose = require('mongoose');

const adoptionSchema = new mongoose.Schema({
  pet: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pet',
    required: true
  },
  applicant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  provider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'completed', 'cancelled'],
    default: 'pending',
    required: true
  },
  applicationDate: {
    type: Date,
    default: Date.now,
    required: true
  },
  completionDate: {
    type: Date
  },
  // Application questions and answers
  applicationDetails: {
    livingArrangement: {
      type: String,
      enum: ['house', 'apartment', 'condo', 'other'],
      required: true
    },
    hasYard: {
      type: Boolean,
      required: true
    },
    hasChildren: {
      type: Boolean,
      required: true
    },
    hasOtherPets: {
      type: Boolean,
      required: true
    },
    otherPetsDetails: {
      type: String
    },
    workSchedule: {
      type: String,
      required: true
    },
    experience: {
      type: String,
      required: true
    },
    reasonForAdoption: {
      type: String,
      required: true
    }
  },
  // Communication history
  messages: [{
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    message: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  // Administrative notes
  notes: [{
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    content: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  // Follow-up information after adoption
  followUp: [{
    date: {
      type: Date,
      required: true
    },
    notes: {
      type: String,
      required: true
    },
    images: [{
      type: String
    }],
    conductedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }]
});

const Adoption = mongoose.model('Adoption', adoptionSchema);

module.exports = Adoption; 
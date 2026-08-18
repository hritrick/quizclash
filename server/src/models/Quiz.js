import mongoose from 'mongoose';

const quizSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Quiz title is required'],
      trim: true,
      minlength: 3,
      maxlength: 120,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: [
        'General Knowledge',
        'History',
        'Science & Tech',
        'Geography',
        'Pop Culture & Movies',
        'Sports & Games',
        'Music & Arts',
        'Mythology & Literature',
      ],
      default: 'General Knowledge',
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    questionIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Question',
      },
    ],
    isPublished: {
      type: Boolean,
      default: true,
    },
    playsCount: {
      type: Number,
      default: 0,
    },
    coverGradient: {
      type: String,
      default: 'amber',
    },
  },
  {
    timestamps: true,
  }
);

export const Quiz = mongoose.model('Quiz', quizSchema);

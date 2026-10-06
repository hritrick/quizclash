import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { Quiz } from '../models/Quiz.js';
import { Question } from '../models/Question.js';
import { MatchHistory } from '../models/MatchHistory.js';
import { Room } from '../models/Room.js';
import { env } from '../config/env.js';
import { logger } from '../config/logger.js';

const seedData = async () => {
  try {
    await mongoose.connect(env.MONGO_URI);
    logger.info('Connected to MongoDB for seeding');

    // Clean existing data
    await User.deleteMany({});
    await Quiz.deleteMany({});
    await Question.deleteMany({});
    await MatchHistory.deleteMany({});
    await Room.deleteMany({});
    logger.info('Cleared existing collections');

    // 1. Create Default Users
    const passwordHash = await User.hashPassword('password123');

    const adminUser = await User.create({
      username: 'QuizMasterAdmin',
      email: 'admin@quizclash.com',
      passwordHash,
      role: 'admin',
      avatarSeed: 'admin_crown_seed',
      stats: { gamesPlayed: 15, totalScore: 18450, wins: 9, correctAnswers: 92, totalAnswers: 110 },
    });

    const hostUser = await User.create({
      username: 'PubTriviaHost',
      email: 'host@quizclash.com',
      passwordHash,
      role: 'host',
      avatarSeed: 'host_mic_seed',
      stats: { gamesPlayed: 10, totalScore: 11200, wins: 4, correctAnswers: 58, totalAnswers: 75 },
    });

    const player1 = await User.create({
      username: 'BrainyAlex',
      email: 'alex@quizclash.com',
      passwordHash,
      role: 'player',
      avatarSeed: 'alex_glasses_seed',
      stats: { gamesPlayed: 24, totalScore: 31200, wins: 14, correctAnswers: 168, totalAnswers: 190 },
    });

    const player2 = await User.create({
      username: 'TriviaQueen_Maya',
      email: 'maya@quizclash.com',
      passwordHash,
      role: 'player',
      avatarSeed: 'maya_star_seed',
      stats: { gamesPlayed: 19, totalScore: 24500, wins: 8, correctAnswers: 130, totalAnswers: 155 },
    });

    const player3 = await User.create({
      username: 'SpeedyGonzales',
      email: 'speedy@quizclash.com',
      passwordHash,
      role: 'player',
      avatarSeed: 'speedy_fox_seed',
      stats: { gamesPlayed: 12, totalScore: 13400, wins: 3, correctAnswers: 72, totalAnswers: 98 },
    });

    logger.info('Created 5 seed users (admin, host, 3 players)');

    // 2. Create Quizzes and Questions
    const quizzesData = [
      {
        title: 'The Ultimate Pub Trivia Clash',
        description: 'A lightning-fast mix of science, history, geography, and world wonders. The ultimate crowd-pleaser!',
        category: 'General Knowledge',
        difficulty: 'medium',
        coverGradient: 'amber',
        createdBy: hostUser._id,
        questions: [
          {
            text: 'Which planet in our solar system has the most extensive ring system?',
            options: ['Jupiter', 'Saturn', 'Uranus', 'Neptune'],
            correctIndex: 1,
            timeLimitSec: 15,
            points: 1000,
            explanation: 'Saturn has the most prominent and extensive ring system, composed primarily of ice particles and rocky debris.',
          },
          {
            text: 'What is the chemical symbol for the element Gold?',
            options: ['Ag', 'Au', 'Gd', 'Fe'],
            correctIndex: 1,
            timeLimitSec: 15,
            points: 1000,
            explanation: 'Au comes from the Latin word "Aurum", meaning shining dawn or gold.',
          },
          {
            text: 'In which ocean is the Mariana Trench, the deepest point on Earth, located?',
            options: ['Atlantic Ocean', 'Indian Ocean', 'Pacific Ocean', 'Arctic Ocean'],
            correctIndex: 2,
            timeLimitSec: 15,
            points: 1000,
            explanation: 'The Mariana Trench is located in the western Pacific Ocean and reaches a depth of about 11,000 meters.',
          },
          {
            text: 'Who was the first person to walk on the moon in July 1969?',
            options: ['Buzz Aldrin', 'Neil Armstrong', 'Michael Collins', 'Yuri Gagarin'],
            correctIndex: 1,
            timeLimitSec: 15,
            points: 1000,
            explanation: 'Neil Armstrong stepped onto the lunar surface on July 20, 1969 during the Apollo 11 mission.',
          },
          {
            text: 'Which continent is home to the largest hot desert in the world?',
            options: ['Asia', 'Africa', 'Australia', 'South America'],
            correctIndex: 1,
            timeLimitSec: 15,
            points: 1000,
            explanation: 'The Sahara Desert spans across 11 countries in Northern Africa.',
          },
        ],
      },
      {
        title: 'Science & Cosmos Blitz',
        description: 'Explore physics, biology, chemistry, and astronomical enigmas that shaped our modern world.',
        category: 'Science & Tech',
        difficulty: 'hard',
        coverGradient: 'teal',
        createdBy: adminUser._id,
        questions: [
          {
            text: 'What particle was discovered at CERN in 2012, confirming the mechanism that gives mass to other particles?',
            options: ['Top Quark', 'Higgs Boson', 'Graviton', 'Neutrino'],
            correctIndex: 1,
            timeLimitSec: 20,
            points: 1500,
            explanation: 'The Higgs Boson particle was theorized by Peter Higgs and confirmed by the ATLAS and CMS experiments at CERN.',
          },
          {
            text: 'What is the powerhouse organelle of eukaryotic cells responsible for producing ATP?',
            options: ['Ribosome', 'Mitochondria', 'Endoplasmic Reticulum', 'Golgi Apparatus'],
            correctIndex: 1,
            timeLimitSec: 15,
            points: 1000,
            explanation: 'Mitochondria generate most of the chemical energy needed to power the cell through oxidative phosphorylation.',
          },
          {
            text: 'What phenomenon causes light to bend when transitioning between different media?',
            options: ['Diffraction', 'Reflection', 'Refraction', 'Polarization'],
            correctIndex: 2,
            timeLimitSec: 15,
            points: 1000,
            explanation: 'Refraction is the change in direction of a wave passing from one medium to another caused by its change in speed.',
          },
          {
            text: 'Which computer programming language was developed by Guido van Rossum and released in 1991?',
            options: ['Java', 'C++', 'Python', 'Ruby'],
            correctIndex: 2,
            timeLimitSec: 15,
            points: 1000,
            explanation: 'Python was created by Guido van Rossum at CWI in the Netherlands.',
          },
        ],
      },
      {
        title: 'World History & Ancient Empires',
        description: 'From the Pyramids of Giza to the Roman Colosseum and Renaissance marvels.',
        category: 'History',
        difficulty: 'medium',
        coverGradient: 'coral',
        createdBy: hostUser._id,
        questions: [
          {
            text: 'In which year did the historic Fall of the Western Roman Empire traditionally occur?',
            options: ['410 AD', '476 AD', '1066 AD', '1453 AD'],
            correctIndex: 1,
            timeLimitSec: 15,
            points: 1000,
            explanation: 'In 476 AD, the last Western Roman Emperor, Romulus Augustulus, was deposed by Odoacer.',
          },
          {
            text: 'Which ancient wonder of the world is the only one that still largely survives today?',
            options: ['Hanging Gardens of Babylon', 'Great Pyramid of Giza', 'Colossus of Rhodes', 'Lighthouse of Alexandria'],
            correctIndex: 1,
            timeLimitSec: 15,
            points: 1000,
            explanation: 'The Great Pyramid of Giza (Khufu) remains substantially intact in Egypt.',
          },
          {
            text: 'Who painted the ceiling of the Sistine Chapel between 1508 and 1512?',
            options: ['Leonardo da Vinci', 'Raphael', 'Michelangelo', 'Donatello'],
            correctIndex: 2,
            timeLimitSec: 15,
            points: 1000,
            explanation: 'Michelangelo was commissioned by Pope Julius II to paint the chapel ceiling.',
          },
        ],
      },
      {
        title: 'Cinema & Pop Culture Trivia',
        description: 'Test your knowledge on Oscar winners, blockbuster cinematic universes, and legendary sound tracks.',
        category: 'Pop Culture & Movies',
        difficulty: 'easy',
        coverGradient: 'violet',
        createdBy: hostUser._id,
        questions: [
          {
            text: 'Which movie won the first ever Academy Award for Best Picture in 1929?',
            options: ['Wings', 'Metropolis', 'Sunrise', 'The Jazz Singer'],
            correctIndex: 0,
            timeLimitSec: 15,
            points: 1000,
            explanation: 'The silent romantic action-war film "Wings" directed by William A. Wellman won the Outstanding Picture award.',
          },
          {
            text: 'In The Lord of the Rings, what is the fictional volcanic mountain where the One Ring must be destroyed?',
            options: ['Mount Doom (Amon Amarth)', 'Lonely Mountain (Erebor)', 'Caradhras', 'Mount Gundabad'],
            correctIndex: 0,
            timeLimitSec: 15,
            points: 1000,
            explanation: 'Mount Doom in Mordor is the only place hot enough to unmake the One Ring forged by Sauron.',
          },
          {
            text: 'What fictional African nation is the home of Marvel superhero Black Panther?',
            options: ['Genosha', 'Wakanda', 'Latveria', 'Sokovia'],
            correctIndex: 1,
            timeLimitSec: 15,
            points: 1000,
            explanation: 'Wakanda is the technologically advanced isolationist nation protected by the Black Panther.',
          },
        ],
      },
    ];

    for (const qData of quizzesData) {
      const { questions, ...quizProps } = qData;
      const quiz = await Quiz.create({
        ...quizProps,
        questionIds: [],
        playsCount: Math.floor(Math.random() * 20) + 5,
      });

      const questionDocs = questions.map((q) => {
        const timesAnswered = Math.floor(Math.random() * 30) + 10;
        return {
          ...q,
          quizId: quiz._id,
          timesAnswered,
          timesCorrect: Math.floor(Math.random() * (timesAnswered + 1)),
          totalAnswerTimeMs: timesAnswered * Math.floor(Math.random() * q.timeLimitSec * 1000),
        };
      });

      const createdQ = await Question.insertMany(questionDocs);
      quiz.questionIds = createdQ.map((q) => q._id);
      await quiz.save();
    }

    logger.info(`Created ${quizzesData.length} quizzes with questions and analytics baseline`);

    // 3. Create Sample Match History
    const firstQuiz = await Quiz.findOne();
    if (firstQuiz) {
      await MatchHistory.create({
        roomId: new mongoose.Types.ObjectId(),
        roomCode: 'CLASH7',
        quizId: firstQuiz._id,
        quizTitle: firstQuiz.title,
        category: firstQuiz.category,
        mode: 'multiplayer',
        totalQuestions: 5,
        players: [
          {
            userId: player1._id,
            username: player1.username,
            avatarSeed: player1.avatarSeed,
            score: 4650,
            rank: 1,
            correctCount: 5,
            totalQuestions: 5,
            powerupsUsed: { fiftyFifty: true, doublePoints: true, freeze: false },
          },
          {
            userId: player2._id,
            username: player2.username,
            avatarSeed: player2.avatarSeed,
            score: 3820,
            rank: 2,
            correctCount: 4,
            totalQuestions: 5,
            powerupsUsed: { fiftyFifty: false, doublePoints: true, freeze: true },
          },
          {
            userId: player3._id,
            username: player3.username,
            avatarSeed: player3.avatarSeed,
            score: 2900,
            rank: 3,
            correctCount: 3,
            totalQuestions: 5,
            powerupsUsed: { fiftyFifty: true, doublePoints: false, freeze: false },
          },
        ],
        playedAt: new Date(Date.now() - 3600 * 1000 * 2),
      });
      logger.info('Created sample match history record');
    }

    logger.info('✅ Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    logger.error(`Seeding error: ${error.message}`);
    process.exit(1);
  }
};

seedData();

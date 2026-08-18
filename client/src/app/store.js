import { configureStore } from '@reduxjs/toolkit';
import roomReducer from '../features/room/roomSlice';
import gameReducer from '../features/game/gameSlice';

export const store = configureStore({
  reducer: {
    room: roomReducer,
    game: gameReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

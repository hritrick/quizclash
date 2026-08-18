import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  roomCode: null,
  quiz: null,
  hostId: null,
  status: 'idle', // 'idle' | 'lobby' | 'in_progress' | 'finished'
  mode: 'multiplayer',
  players: [],
  spectatorCount: 0,
  isSpectator: false,
  error: null,
};

export const roomSlice = createSlice({
  name: 'room',
  initialState,
  reducers: {
    setRoomData: (state, action) => {
      const { room, isSpectator } = action.payload;
      state.roomCode = room.code;
      state.quiz = room.quizId;
      state.hostId = room.hostId?._id || room.hostId;
      state.status = room.status;
      state.mode = room.mode || 'multiplayer';
      state.players = room.players || [];
      state.spectatorCount = room.spectatorIds?.length || 0;
      if (isSpectator !== undefined) {
        state.isSpectator = isSpectator;
      }
      state.error = null;
    },
    updatePlayers: (state, action) => {
      state.players = action.payload.players;
      if (action.payload.spectatorsCount !== undefined) {
        state.spectatorCount = action.payload.spectatorsCount;
      }
    },
    setRoomStatus: (state, action) => {
      state.status = action.payload;
    },
    setRoomError: (state, action) => {
      state.error = action.payload;
    },
    resetRoom: () => initialState,
  },
});

export const { setRoomData, updatePlayers, setRoomStatus, setRoomError, resetRoom } =
  roomSlice.actions;

export default roomSlice.reducer;

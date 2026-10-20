import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
const uiSlice = createSlice({
  name: 'ui',
  initialState: { teamId: null as string | null },
  reducers: {
    selectTeam(state, action: PayloadAction<string | null>) {
      state.teamId = action.payload;
    },
  },
});
export const { selectTeam } = uiSlice.actions;
export default uiSlice.reducer;

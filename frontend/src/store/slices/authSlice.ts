import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Session } from '../../types/auth.types';
interface AuthState {
  session: Session | null;
  bootstrapping: boolean;
}
const initialState: AuthState = { session: null, bootstrapping: true };
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    signedIn(state, action: PayloadAction<Session>) {
      state.session = action.payload;
      state.bootstrapping = false;
    },
    signedOut(state) {
      state.session = null;
      state.bootstrapping = false;
    },
    bootstrapFinished(state) {
      state.bootstrapping = false;
    },
  },
});
export const { signedIn, signedOut, bootstrapFinished } = authSlice.actions;
export default authSlice.reducer;

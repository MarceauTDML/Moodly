import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Session, SessionTokens } from '../../types/auth.types';
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
    tokensRefreshed(state, action: PayloadAction<SessionTokens>) {
      if (!state.session) return;
      state.session.token = action.payload.token;
      state.session.refreshToken = action.payload.refreshToken;
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
export const { signedIn, tokensRefreshed, signedOut, bootstrapFinished } = authSlice.actions;
export default authSlice.reducer;

import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Session, SessionTokens } from '../../types/auth.types';
interface AuthState {
  session: Session | null;
  bootstrapping: boolean;
  // Restauration impossible sans que le serveur ait refusé la session (réseau, serveur arrêté).
  bootstrapError: string | null;
  bootstrapAttempt: number;
}
const initialState: AuthState = {
  session: null,
  bootstrapping: true,
  bootstrapError: null,
  bootstrapAttempt: 0,
};
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    signedIn(state, action: PayloadAction<Session>) {
      state.session = action.payload;
      state.bootstrapping = false;
      state.bootstrapError = null;
    },
    tokensRefreshed(state, action: PayloadAction<SessionTokens>) {
      if (!state.session) return;
      state.session.token = action.payload.token;
      state.session.refreshToken = action.payload.refreshToken;
    },
    signedOut(state) {
      state.session = null;
      state.bootstrapping = false;
      state.bootstrapError = null;
    },
    bootstrapFinished(state) {
      state.bootstrapping = false;
    },
    bootstrapFailed(state, action: PayloadAction<string>) {
      state.bootstrapping = false;
      state.bootstrapError = action.payload;
    },
    bootstrapRetried(state) {
      state.bootstrapping = true;
      state.bootstrapError = null;
      state.bootstrapAttempt += 1;
    },
  },
});
export const {
  signedIn,
  tokensRefreshed,
  signedOut,
  bootstrapFinished,
  bootstrapFailed,
  bootstrapRetried,
} = authSlice.actions;
export default authSlice.reducer;

import { configureStore, createListenerMiddleware, isAnyOf } from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';
import authReducer, { signedOut } from './slices/authSlice';
import uiReducer, { selectTeam } from './slices/uiSlice';
import { baseApi } from './api/baseApi';
import { secureStorage } from '../services/secureStorage.client';
const listener = createListenerMiddleware();
listener.startListening({
  matcher: isAnyOf(signedOut),
  effect: async (_, api) => {
    api.dispatch(baseApi.util.resetApiState());
    api.dispatch(selectTeam(null));
    await secureStorage.clearToken().catch(() => undefined);
  },
});
export const store = configureStore({
  reducer: { auth: authReducer, ui: uiReducer, [baseApi.reducerPath]: baseApi.reducer },
  middleware: (getDefault) => getDefault().prepend(listener.middleware).concat(baseApi.middleware),
  devTools: false,
});
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();

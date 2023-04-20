import { eventBus } from './index';
import { OpacityType } from '../types';
import { SET_GLOBAL_LOADING } from '../constants/events';

export const setLoading = (loading: boolean | OpacityType, loadingText?: string) =>
  eventBus.emit(SET_GLOBAL_LOADING, loading, loadingText);

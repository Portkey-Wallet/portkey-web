import { eventBus } from './index';
import { LoadingInfoType, OpacityType } from '../types';
import { SET_GLOBAL_LOADING } from '../constants/events';

export const setLoading = (loading: boolean | OpacityType, loadingInfo?: LoadingInfoType) =>
  eventBus.emit(SET_GLOBAL_LOADING, loading, loadingInfo);

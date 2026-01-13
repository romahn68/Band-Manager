import { useContext } from 'react';
import { AppContext } from './Contexts';

export const useApp = () => useContext(AppContext);

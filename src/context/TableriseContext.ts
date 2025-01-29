import { TableriseContextContract } from '@/types/modules/context/TableriseContext';
import { createContext } from 'react';

const TableriseContext = createContext({} as TableriseContextContract);

export default TableriseContext;

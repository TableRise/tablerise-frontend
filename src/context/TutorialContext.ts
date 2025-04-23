import { TutorialContextContract } from '@/types/modules/context/TutorialContext';
import { createContext } from 'react';

const TutorialContext = createContext({} as TutorialContextContract);

export default TutorialContext;

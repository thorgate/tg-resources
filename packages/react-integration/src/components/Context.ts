import { createContext } from 'react';

import { RouterContextProvidedProps } from '../types';

export const ReactResourcesContext = createContext<
    RouterContextProvidedProps | undefined
>(undefined);

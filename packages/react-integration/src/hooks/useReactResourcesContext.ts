import invariant from 'invariant';
import { useContext } from 'react';

import { ReactResourcesContext } from '../components/Context';
import { RouterContextProvidedProps } from '../types';

export function useReactResourcesContext(): RouterContextProvidedProps {
    const contextValue = useContext(ReactResourcesContext);

    invariant(
        contextValue,
        'Could not find @tg-resources/react context value. Ensure component is wrapped in a <ReactResourceProvider>'
    );

    // Invariant throws when context value is not defined
    return contextValue as any;
}

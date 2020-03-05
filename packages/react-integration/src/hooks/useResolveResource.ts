import { Resource } from '@tg-resources/core';

import { useReactResourcesContext } from './useReactResourcesContext';

export function useResolveResource(routeName: string): Resource {
    const resourceContext = useReactResourcesContext();

    // If resource is not found, then error is returned and ErrorBoundary should catch it
    return resourceContext.resolveResource(routeName);
}

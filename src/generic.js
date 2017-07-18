// We use superagent as a default worker
import SuperAgentResource, { SuperagentResponse } from './superagent';


// import SingleObjectResource factory
import makeSingle from './single';


// Export everything
export const GenericResource = SuperAgentResource;
export const Resource = makeSingle(SuperAgentResource);
export const Response = SuperagentResponse;

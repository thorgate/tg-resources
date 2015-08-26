// We use superagent as a default worker
import {resource as GenericResource} from './superagent';

// import SingleObjectResource factory
import makeSingle from './single';

// Export everything
export default GenericResource;
export {getConfig, setConfig} from './init';
export const SingleObjectResource = makeSingle(GenericResource);

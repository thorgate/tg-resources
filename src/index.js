// We use superagent as a default worker
import {resource as Resource} from './superagent';

// import SingleObjectResource factory
import makeSingle from './single';

// Export everything
export const GenericResource = Resource;
export {getConfig, setConfig} from './init';
export {InvalidResponseCode, ValidatonError} from './errors';
export default makeSingle(Resource);

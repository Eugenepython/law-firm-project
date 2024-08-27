// /resolvers/mutations/index.js

import { lawFirmMutations } from './lawFirmMutations.js';
import { providerMutations } from './providerMutations.js';
import { authMutations } from './authMutations.js';

const Mutation = {
  ...lawFirmMutations,
  ...providerMutations,
  ...authMutations,
};

export default Mutation;

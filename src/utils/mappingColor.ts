import type { Mapping } from '../types/controllers';
import { target } from './midi';
// Check the actual Mixxx destination: master/sampler/effect parameters can retain
// a deck field that does not participate in their mapping.
export const isDeckTwoMapping = (mapping?: Mapping) =>
	Boolean(mapping && target(mapping).some((part) => part.includes('[Channel2]')));

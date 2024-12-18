import { AirtakeClient } from './client';
import type { AirtakeOptions } from './types';

export const Airtake = {
  init: (options: AirtakeOptions) => {
    return new AirtakeClient(options);
  },
};

export type { AirtakeOptions, Props } from './types';

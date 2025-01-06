import { AirtakeClient } from './client';
import type { AirtakeOptions } from './types';

export const Airtake = {
  init: (options: AirtakeOptions) => {
    return new AirtakeClient(options);
  },
};

export type { AirtakeOptions, IdentifyProps, Props, TrackProps } from './types';

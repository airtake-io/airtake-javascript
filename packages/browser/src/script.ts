import { AirtakeClient } from './client';
import type { AirtakeOptions, Props } from './types';

class Airtake {
  private client?: AirtakeClient;

  init(options: AirtakeOptions) {
    this.client = new AirtakeClient(options);
  }

  track(event: string, props?: Props) {
    this.client?.track(event, props);
  }

  identify(actorId: string | number, props?: Props) {
    this.client?.identify(actorId, props);
  }
}

// @ts-expect-error Assigning global variable
window.Airtake = new Airtake();

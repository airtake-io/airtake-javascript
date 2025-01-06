import { nanoid } from 'nanoid/non-secure';
import { populateProps } from './props';
import type { AirtakeOptions, IdentifyProps, TrackProps } from './types';

export class AirtakeClient {
  private enabled = true;
  private baseUrl = 'https://ingest.airtake.io';

  private token: string;

  constructor(options: AirtakeOptions) {
    this.token = options.token;

    if (options.enabled === false) {
      this.enabled = false;
    }

    if (options.baseUrl) {
      this.baseUrl = options.baseUrl;
    }
  }

  track(event: string, props: TrackProps) {
    const actorId = props.$actor_id ?? props.$device_id;
    if (!actorId) {
      throw new Error('Either $actor_id or $device_id is required');
    }

    this.request({
      type: 'track',
      id: nanoid(32),
      timestamp: Date.now(),
      actorId,
      name: event,
      props: {
        ...populateProps(),
        ...props,
      },
    });
  }

  identify(actorId: string | number, props: IdentifyProps) {
    const { $device_id, ...rest } = props;

    this.request({
      type: 'identify',
      id: nanoid(32),
      timestamp: Date.now(),
      actorId,
      deviceId: $device_id,
      props: {
        ...populateProps(),
        ...rest,
      },
    });
  }

  private get endpoint() {
    return `${this.baseUrl}/v1/events`;
  }

  private request(body: Record<string, unknown>) {
    if (!this.enabled) {
      return;
    }

    fetch(this.endpoint, {
      method: 'POST',
      keepalive: true,
      headers: {
        'Content-Type': 'application/json',
        'X-Airtake-Token': this.token,
      },
      body: JSON.stringify(body),
    });
  }
}

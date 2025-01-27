import { nanoid } from 'nanoid';
import { ACTOR_ID_KEY, DEVICE_ID_KEY } from './const';
import { extractDocument, getTarget } from './dom';
import { populateProps } from './props';
import type { AirtakeOptions, Props } from './types';

export class AirtakeClient {
  private enabled = true;
  private baseUrl = 'https://ingest.airtake.io';

  private token: string;
  private actorId?: string | number;
  private deviceId!: string;

  constructor(options: AirtakeOptions) {
    this.token = options.token;

    if (options.enabled === false) {
      this.enabled = false;
    }

    if (options.baseUrl) {
      this.baseUrl = options.baseUrl;
    }

    if (this.localStorageAvailable) {
      const actorId = localStorage.getItem(ACTOR_ID_KEY);
      const deviceId = localStorage.getItem(DEVICE_ID_KEY);

      if (actorId) {
        this.actorId = actorId;
      }

      if (deviceId) {
        this.deviceId = deviceId;
      } else {
        this.issueDeviceId();
      }
    }

    if (options.experimental?.autotrack) {
      this.observe();
    }
  }

  track(event: string, props?: Props) {
    const actorId = this.actorId ?? this.deviceId;
    if (!actorId) {
      throw new Error('Actor ID is required');
    }

    this.request({
      type: 'track',
      id: nanoid(32),
      timestamp: Date.now(),
      actorId,
      name: event,
      props: {
        $actor_id: actorId,
        $device_id: this.deviceId,
        ...populateProps(),
        ...props,
      },
    });
  }

  identify(actorId: string | number, props?: Props) {
    this.actorId = actorId;

    if (this.localStorageAvailable) {
      localStorage.setItem(ACTOR_ID_KEY, actorId.toString());
    }

    this.request({
      type: 'identify',
      id: nanoid(32),
      timestamp: Date.now(),
      actorId,
      deviceId: this.deviceId,
      props: {
        ...populateProps(),
        ...props,
      },
    });
  }

  reset() {
    if (this.localStorageAvailable) {
      localStorage.removeItem(ACTOR_ID_KEY);
      localStorage.removeItem(DEVICE_ID_KEY);
    }

    this.actorId = undefined;
    this.issueDeviceId();
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
        'X-Airtake-CI': '1',
      },
      body: JSON.stringify(body),
    });
  }

  private issueDeviceId() {
    this.deviceId = `$device:${crypto.randomUUID()}`;

    if (this.localStorageAvailable) {
      localStorage.setItem(DEVICE_ID_KEY, this.deviceId);
    }
  }

  private observe() {
    const handler = async (event: Event) => {
      const actorId = this.actorId ?? this.deviceId;
      if (!actorId) {
        return;
      }

      const document = await extractDocument();
      const target = await getTarget(event.target as Element);

      this.request({
        type: 'auto_track',
        id: nanoid(32),
        timestamp: Date.now(),
        actorId,
        target,
        document,
        props: {
          $actor_id: actorId,
          $device_id: this.deviceId,
          ...populateProps(),
        },
      });
    };

    window.addEventListener('click', handler, true);
  }

  private get endpoint() {
    return `${this.baseUrl}/v1/events`;
  }

  private get localStorageAvailable() {
    return typeof localStorage !== 'undefined';
  }
}

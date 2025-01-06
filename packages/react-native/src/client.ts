import AsyncStorage from '@react-native-async-storage/async-storage';
import { nanoid } from 'nanoid/non-secure';
import uuid from 'react-native-uuid';
import { ACTOR_ID_KEY, DEVICE_ID_KEY } from './const';
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

    AsyncStorage.getItem(ACTOR_ID_KEY).then((actorId) => {
      this.actorId = actorId ?? undefined;
    });

    AsyncStorage.getItem(DEVICE_ID_KEY).then((deviceId) => {
      if (deviceId) {
        this.deviceId = deviceId;
      } else {
        this.issueDeviceId();
      }
    });
  }

  async track(event: string, props?: Props) {
    const actorId = this.actorId ?? (await this.getDeviceId());
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

  async identify(actorId: string | number, props?: Props) {
    this.actorId = actorId;
    AsyncStorage.setItem(ACTOR_ID_KEY, actorId.toString());

    this.request({
      type: 'identify',
      id: nanoid(32),
      timestamp: Date.now(),
      actorId,
      deviceId: await this.getDeviceId(),
      props: {
        ...populateProps(),
        ...props,
      },
    });
  }

  reset() {
    AsyncStorage.removeItem(ACTOR_ID_KEY);
    AsyncStorage.removeItem(DEVICE_ID_KEY);

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

  private async getDeviceId() {
    if (this.deviceId) {
      return this.deviceId;
    }

    return this.issueDeviceId();
  }

  private async issueDeviceId() {
    this.deviceId = `$device:${uuid.v4()}`;
    await AsyncStorage.setItem(DEVICE_ID_KEY, this.deviceId);
    return this.deviceId;
  }

  private get endpoint() {
    return `${this.baseUrl}/v1/events`;
  }
}

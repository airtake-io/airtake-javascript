import { nanoid } from 'nanoid';
import { ACTOR_ID_KEY, DEVICE_ID_KEY } from './const';
import { populateProps } from './props';

type AirtakeOptions = {
  baseUrl?: string;
  token: string;
};

type PropValue = string | number | boolean | undefined | null;
type Props = Record<string, PropValue | PropValue[]>;

class AirtakeClient {
  private baseUrl = 'https://ingest.airtake.io';

  private token?: string;
  private actorId?: string | number;
  private deviceId?: string;

  init(options: AirtakeOptions) {
    this.token = options.token;

    if (options.baseUrl) {
      this.baseUrl = options.baseUrl;
    }

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
    localStorage.setItem(ACTOR_ID_KEY, actorId.toString());

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
    localStorage.removeItem(ACTOR_ID_KEY);
    localStorage.removeItem(DEVICE_ID_KEY);

    this.actorId = undefined;
    this.deviceId = undefined;

    this.issueDeviceId();
  }

  private get endpoint() {
    return `${this.baseUrl}/v1/events`;
  }

  private request(body: Record<string, unknown>) {
    if (!this.token) {
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
    localStorage.setItem(DEVICE_ID_KEY, this.deviceId);
  }
}

const Airtake = new AirtakeClient();

// eslint-disable-next-line import/no-default-export
export default Airtake;

export type AirtakeOptions = {
  token: string;
  enabled?: boolean;
  baseUrl?: string;
};

type Value = string | number | boolean | undefined | null;
export type Props = Record<string, Value | Value[]>;

export type TrackProps = Props &
  ({ $actor_id?: string | number; $device_id: string } | { $actor_id: string | number; $device_id?: string });
export type IdentifyProps = Props & { $device_id?: string };

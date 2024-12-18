export type AirtakeOptions = {
  token: string;
  enabled?: boolean;
  baseUrl?: string;
};

type Value = string | number | boolean | undefined | null;
export type Props = Record<string, Value | Value[]>;

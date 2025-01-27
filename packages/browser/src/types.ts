export type AirtakeOptions = {
  token: string;
  enabled?: boolean;
  baseUrl?: string;

  experimental?: {
    autotrack?: boolean;
  };
};

type Value = string | number | boolean | undefined | null;
export type Props = Record<string, Value | Value[]>;

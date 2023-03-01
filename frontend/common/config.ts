const flow = {
  deploymentAccountAddress:
    (process.env.NEXT_PUBLIC_FLOW_DEPLOYMENT_ACCOUNT_ADDRESS as any) ||
    "0xf8d6e0586b0a20c7",
};

export type AppEnvironment = "development" | "staging" | "production";
export const environment: AppEnvironment = (process.env
  .NEXT_PUBLIC_BLUFI_ENV || "staging") as AppEnvironment;

const apiHost = "http://localhost:3001";

export const config = {
  flow,
  apiHost,
  environment,
};

export function getDomain() {
  // This function is also used on the backend (during SSR).
  const domain =
    typeof window !== "undefined"
      ? window.location.host
      : "http://localhost:3000";
  switch (environment) {
    case "production":
    case "staging":
      return `https://${domain}`;
    case "development":
      return `http://${domain}`;
  }
}

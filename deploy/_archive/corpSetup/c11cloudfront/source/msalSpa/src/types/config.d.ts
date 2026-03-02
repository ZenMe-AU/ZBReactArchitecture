export {};

declare global {
  interface Window {
    __APP_CONFIG__?: {
      clientId: string;
      redirectUri: string;
    };
  }
}

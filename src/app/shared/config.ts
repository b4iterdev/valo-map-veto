export class Config {
    serverUrl = "http://localhost:3000";
    public constructor(init?: Partial<Config>) {
        Object.assign(this, init);
      }
}
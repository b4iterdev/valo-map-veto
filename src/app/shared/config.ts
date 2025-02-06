export class Config {
  serverUrl = 'http://localhost:3000';
  mapList = ["Ascent", "Bind", "Haven", "Icebox", "Split"];
  vetoOrder = [
    { order : 1, type: 'ban' , map: 0 },
    { order : 2, type: 'ban' , map: 1 },
    { order : 3, type: 'pick' , map: 0 , side: 1 },
    { order : 4, type: 'pick' , map: 1 , side: 0 },
    { order : 5, type: 'ban' , map: 0 },
    { order : 6, type: 'decider' , map: 1, side: 0 },
  ];
  public constructor(init?: Partial<Config>) {
    Object.assign(this, init);
  }
}

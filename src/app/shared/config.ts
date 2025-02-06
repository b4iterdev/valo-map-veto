export class Config {
  serverUrl = 'http://localhost:3000';
  mapList = [
    { name: 'Ascent', imageUrl: '/assets/maps/Ascent.png' },
    { name: 'Bind', imageUrl: '/assets/maps/Bind.png' },
    { name: 'Haven', imageUrl: '/assets/maps/Haven.png' },
    { name: 'Abyss', imageUrl: '/assets/maps/Abyss.png' },
    { name: 'Pearl', imageUrl: '/assets/maps/Pearl.png' },
    { name: 'Split', imageUrl: '/assets/maps/Split.png' },
    { name: 'Sunset', imageUrl: '/assets/maps/Sunset.png' },
  ];
  public constructor(init?: Partial<Config>) {
    Object.assign(this, init);
  }
}

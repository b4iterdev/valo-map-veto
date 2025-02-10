# Valorant Map Veto Helper

Valorant Map and Side selection Helper, which deploy a WebUI for tournament organizer to conduct map veto on offline event.

# Features

Differ from other available map veto in the internet, this is especially designed for offline event, where the hosts will call team leaders to start veto, and the host will be the one who does changes, based on verbal answers from both team leaders.

Also this stictly follows VCT Map Veto Process. You can customize your veto order on `/create-advanced`, and even use HTTP request to create a match, which returns JSON type with status and generated id.

# Configuration

Abilities to change `serverUrl` are WIP. You would likely to change `serverUrl` in `app/shared/config.ts` point to the URL where the server is hosted at.

In the future you can easily change by changing `serverUrl` at `config/config.json`. But that will not work for now.

# Installation

More flexible installation using Docker are WIP.

While for local deployment you can simply run `npm install` and `npm start:prod` to start both the frontend and server, or `npm start:server` to only start the server and `npm build` to build static site for serving with existing web server.

Also worth noting that you might need to rebuild the static site when you change `serverUrl` as indicated in #Configuration

# Usage:
On static, going to root will get you to simple match creation, which uses current competition map pool and standard veto order.
* [/create-advanced](https://veto.b4iterdev.net.eu.org/create-advanced) Allows you to change map pool and veto order, keep in mind that best of input box in this case only served to store, as it's affected by your veto order.

On server endpoint: 3 endpoint are available: (Demo server: https://veto-server.b4iterdev.net.eu.org/)
* `/create?leftTeam=(Left Team Name)&rightTeam=(Right Team Name)&bestOf=(1,3,5)` will create a match with current competition map pool and standard veto order. Return `sessionId` if success
* `/session/:sessionId`: Return ongoing veto session data.
* `/result/:sessionId`: Return finished veto session data.

# Credit
* [Valorant-API](https://valorant-api.com/) for providing API for map images retrieving.
* And many more dependencies used on this project, go to `package.json` for more info.

# Legal disclaimer

Valorant Map Veto Helper was created under Riot Games's "Legal Jibber Jabber" policy using assets owned by Riot Games. Valorant Map Veto Helper isn't endorsed by Riot Games and doesn't reflect the views or opinions of Riot Games or anyone officially involved in producing or managing Riot Games properties. Riot Games and all associated properties are trademarks or registered trademarks of Riot Games, Inc.

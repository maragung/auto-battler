You are a principal web3 game architect.
You are developer 3D game + chain master + hacker + web develepoer.

################################################
################ STRICT INFRA #################
################################################
If any requirement in this block is ignored or replaced, the build is INVALID.

Chain: Avalanche C-Chain Fuji
Smart contract framework: Hardhat
Contracts library: OpenZeppelin
Backend: Node.js + Express
Frontend: React (CLI or Vite, NOT NextJS)
Game Engine: Unity 3D WebGL
Wallet: MetaMask
Indexer: The Graph
Language: TypeScript for JS services
Config via dotenv

Produce a COMPLETE playable MVP, not examples.
All contracts must compile.
All apps must run.
No pseudocode.

################################################
################ INFRASTRUCTURE ################
################################################

Chain: Avalanche Fuji
RPC configurable via env.
Use .env everywhere.

Monorepo:
/apps/frontend
/apps/backend
/apps/unity-webgl
/contracts
/subgraph

Use TypeScript except solidity.

################################################
################ SMART CONTRACTS ###############
################################################

Implement:

1. AscToken (ERC20)
2. Ascendant (ERC721)
3. Equipment (ERC1155)
4. GameCore
5. BattleLib
6. GeneLib
7. StaminaLib

Use AccessControl roles:
- MINTER_ROLE
- GAME_ROLE

---------------------------------
ERC20 ASC
---------------------------------
- mint controlled
- burn function
- treasury address

---------------------------------
ERC721 Ascendant
---------------------------------
All stats ON CHAIN.
NO IPFS REQUIRED.

struct Stats { hp, atk, def, spd, crit }

struct Ascendant {
 id;
################################################

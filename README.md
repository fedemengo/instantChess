# Chess 1vs1

### How to play

* `git clone https://github.com/fedemengo/instantChess.git`
* `cd instantChess`
* `npm install`
* `node index`
* white player open `localhost:3000/`
* url for black player is displayed
* black player open url

### Features

- [x] Moves listing: Long algebraic notation
- [ ] Recognize valid moves (in progress)
- [ ] Mutliple games at once (on the same server)
- [ ] Close and resume a game

### TODO

- Rewrite using Chess.js library (?)
- ~~At least should work~~
- ~~Traditional moves listing~~
- ~~General refactoring~~
- ~~One move per turn~~
- ~~Take back a move (place piece back to its square)~~
- Check for allowed moves
	- ~~Pawns~~ (no promotion)
	- ~~Rooks~~
	- ~~Bishop~~
	- ~~Knight~~
	- ~~Queen (Rook || Bishop)~~
	- King (castle!)
	- ~~piece of the same color can't take each other~~
	- moves should not put the king in check
- ~~Respectable GUI~~
- Super amazing GUI
- Multiple games
- Resume game

---

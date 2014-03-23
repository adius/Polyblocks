var _sockets = null,
	_field = newMatrix(20, 20),
	_player = [],
	_types = [
				[
					[0, 0, 0, 0, 0],
					[0, 0, 1, 0, 0],
					[0, 1, 1, 1, 0],
					[0, 0, 0, 0, 0],
					[0, 0, 0, 0, 0]
				], [
					[0, 0, 0, 0, 0],
					[0, 0, 1, 1, 0],
					[0, 1, 1, 0, 0],
					[0, 0, 0, 0, 0],
					[0, 0, 0, 0, 0]
				], [
					[0, 0, 0, 0, 0],
					[0, 1, 1, 0, 0],
					[0, 0, 1, 1, 0],
					[0, 0, 0, 0, 0],
					[0, 0, 0, 0, 0]
				], [
					[0, 0, 0, 0, 0],
					[0, 1, 1, 0, 0],
					[0, 1, 1, 0, 0],
					[0, 0, 0, 0, 0],
					[0, 0, 0, 0, 0]
				], [
					[0, 0, 0, 0, 0],
					[0, 0, 1, 0, 0],
					[0, 0, 1, 0, 0],
					[0, 0, 1, 0, 0],
					[0, 0, 1, 0, 0]
				], [
					[0, 0, 0, 0, 0],
					[0, 0, 1, 0, 0],
					[0, 0, 1, 0, 0],
					[0, 0, 1, 0, 0],
					[0, 0, 1, 0, 0]
				], [
					[0, 0, 0, 0, 0],
					[0, 0, 1, 0, 0],
					[0, 0, 1, 0, 0],
					[0, 1, 1, 0, 0],
					[0, 0, 0, 0, 0]
				], [
					[0, 0, 0, 0, 0],
					[0, 0, 1, 0, 0],
					[0, 0, 1, 0, 0],
					[0, 0, 1, 1, 0],
					[0, 0, 0, 0, 0]
			]
		],
	_blockid = 0,
	_pid = 1,
	_timeout = 500,
	x,
	i, y


exports.index = function (req, res) {
	res.send('hello world')
}

exports.init = function (sockets) {
	_sockets = sockets
	_sockets.on('connection', newPlayer)
	setTimeout(gameloop, _timeout)
}

function sendBaseData() {
	_sockets.emit('base', {players: _player, field: _field})
}

function gameloop() {
	movePiecesDown()
	//checkPlacement()
	//checkLines()
	sendBaseData()
	setTimeout(gameloop,_timeout)
}


function newPlayer(socket) {
	// create new Player object
	_player.push(_playerproto = {
		pid: ++_pid,
		name: 'rnd'
	})
	newPiece(_player[_player.length-1])

	socket.on('update', recvUpdate)
	socket.on('disconnect', recvDisconnect)
	socket['pid']=_pid
	sendBaseData()
}

function newPiece(player) {
	player.position = [0, 0]
	player.rotation = 0
	player.type = 0,
	player.id = _blockid++
}

function recvUpdate(data) {
	console.log(data)
	//handle movement
	//sendBaseData()
}

function recvDisconnect(data,socket) {
	console.log('disconnect')
	_field = newMatrix(20,20)
	pidToDelete = -1;
	for (var i = 0; i < _player.length; i++) {
		if (_player[i].pid == this.pid){
			pidToDelete = this.pid
		}
	}
	_player = _player.splice(pidToDelete, 1)

}

function movePiecesDown() {
	for (i = 0; i < _player.length; i++) {
		_player[i].position[1]++
		if (isColliding(_player[i])){
			_player[i].position[1]--
			placePiece(_player[i])
			_player[i].position[1]=0
		}
	}
}

function checkLines() {

	var lineFull

	for (y = 0; y < _field[0].length; y++) {

		lineFull = true

		for (x = 0; x < _field.length; x++) {
			if (!_field[x][y]) {
				lineFull = false;
				break
			}
		}
		if (lineFull)
			return clearLine(y)
	}
}

function placePiece(player){
	var x = player.position[0],
		y = player.position[1],
		matrix = rotateMatrix(_types[player.type],player.rotation)

	for (var dy = 0; dy < matrix.length; dy++){
		for (var dx = 0; dx < matrix[0].length; dx++){
			if (matrix[dy][dx]){
				_field[dx+x][dy+y] = {type: player.type, id: player.id, owner: player.pid}
			}
		}
	}
}

function isColliding(player){
	var x = player.position[0],
		y = player.position[1],
		matrix = rotateMatrix(_types[player.type],player.rotation)

	for (var dy = 0; dy < matrix.length; dy++){
		for (var dx = 0; dx < matrix[0].length; dx++){
			if (matrix[dy][dx]){
				if ( dx+x < 0 || dy+y < 0 || dx+x >= _field[0].length|| dy+y >= _field.length || _field[dx+x][dy+y]){
					return true
				}
			}
		}
	}
	return false
}

// Matrix-Manipulation
function rotateMatrix(matrix, n) {

	var rotMatrix,
		_n

	for (_n = 0, y; _n < n; _n++) {
		rotMatrix = newMatrix(matrix.length, matrix[0].length)
		for (y = 0; y < matrix.length; y++) {
			for (x = 0; x < matrix[0].length; x++) {
				rotMatrix[x][matrix[0].length - 1 - y] = matrix[y][x]
			}
		}
		matrix = rotMatrix
	}

	return matrix
}

function newMatrix(n, m) {

	var matrix = [],
		y

	for (y = 0; y < n; y++) {
		matrix.push([]);
		for (x = 0; x < m; x++) {
			matrix[y].push(undefined)
		}
	}

	return matrix
}
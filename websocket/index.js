var GameManager = require('../game/manager');
var io = null;

var initSocket4Mobbing = function(socket) {
    // TODO : impl
}

var initSocket4Game = function(socket) {
    var world = null;
    var player = null;

    socket.on('join', function(worldId) {
        console.log('join');
        // socket
        socket.join(worldId);
        // game
        world = GameManager.getWorld(worldId);
        player = world.add(socket.id);
        world.start(function(world) {
            socket.broadcast.to(worldId).emit('update', {players: world.players});
        });
    });

    socket.on('disconnect', function() {
        console.log('disconnect');
        // socket
        socket.leave();
        // game
        if (world !== null)
            world.remove(socket.id);
        player = null;
        world = null;
    });

    socket.on('key', function(data) {
        player.updateKey(data.key, data.status);
    });
}

module.exports = {
    initialize: function(app) {
        if (io === null) {
            io = require('socket.io').listen(app);
            io.set('log level', 1);
        }

        // mobbing : general information
        io.of('/mobbing').on('connection', function(socket) {
            socket.emit('connected');
            initSocket4Mobbing(socket);
        });

        // events : game information (high fps)
        io.of('/game').on('connection', function(socket) {
            socket.emit('connected', {id: socket.id});
            initSocket4Game(socket);
        });
    }
}

var GameManager = require('../game/manager');
var io = null;

var initSocket4Mobbing = function(socket) {
    // TODO : impl
}

var initSocket4Game = function(socket) {
    var world = null;
    var player = null;

    socket.on('join', function(msg) {
        console.log('join');
        console.log(msg);
        var worldId = msg.eventId;
        var userId = msg.userId;
        // socket
        socket.join(worldId);
        // game
        world = GameManager.getWorld(worldId);
        player = world.add(socket.id, userId);
    });

    socket.on('start', function() {
        io.of('/game').in(world.id).emit('start');
        world.start(
            function(world) {
                io.of('/game').in(world.id).emit('update', {players: world.players});
            },
            function() {
                io.of('/game').in(world.id).emit('end');
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
            socket.emit('connected', {socketId: socket.id});
            initSocket4Game(socket);
        });
    }
}

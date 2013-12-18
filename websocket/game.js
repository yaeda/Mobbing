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
        var worldId = msg.eventId;
        var userId = msg.userId;
        // socket
        socket.join(worldId);
        // world
        world = GameManager.getWorld(worldId);
        if (world.isPlaying()) {
            socket.emit('start');
            return;
        }
        // player
        player = world.add(socket.id, userId);
        // notify
        io.of('/game').in(worldId).emit('joined', {joined: player, all: world.players});
    });

    socket.on('start', function() {
        io.of('/game').in(world.id).emit('start');
        world.start(
            function(world) { // callback
                var remainTime = world.getRemainTimeSec();
                io.of('/game').in(world.id).emit('update', {players: world.players, remainTime: remainTime});
            },
            function() { // endCallback
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
        // notify
        io.of('/game').in(world.id).emit('leaved', {leaved: player, all: world.players});
        player = null;
        world = null;
    });

    socket.on('key', function(data) {
        if (player !== null)
            player.updateKey(data.key, data.status);
    });
}

module.exports = {
    initialize: function(app, socketio) {
        if (socketio === null) {
            io = require('socket.io').listen(app);
            io.set('log level', 1);
        } else {
            io = socketio;
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

"use strict";

var DEBUG_MODE = false;

var Renderer = function() {
    this.width = 500;
    this.height = 500;
    this._canvas = document.getElementById('game_field');
    this._ctx = this._canvas.getContext('2d');
}

Renderer.prototype = {

    _drawCircle: function(x, y, color) {
        this._ctx.beginPath();
        this._ctx.arc(x, y, 10, 0, Math.PI * 2);
        this._ctx.fillStyle = color;
        this._ctx.fill();
    },

    _drawCross: function(x, y, r) {
        var s = 10 * Math.sin(-r - Math.PI * 45 / 180);
        var c = 10 * Math.cos(r + Math.PI * 45 / 180);
        this._ctx.beginPath();
        this._ctx.moveTo(x + s, y + c);
        this._ctx.lineTo(x - s, y - c);
        this._ctx.moveTo(x + c, y - s);
        this._ctx.lineTo(x - c, y + s);
        this._ctx.lineWidth = 2;
        this._ctx.strokeStyle = '#FFFFFF';
        this._ctx.stroke();
    },

    _drawFOV: function(x, y, r, angle, radius, color) {
        this._ctx.beginPath();
        this._ctx.moveTo(x, y);
        this._ctx.arc(x, y, radius, r - angle / 2, r + angle / 2);
        this._ctx.closePath();
        this._ctx.fillStyle = color;
        this._ctx.fill();
    },

    _canSee: function(me, other) {
        var dx = other.x - me.x;
        var dy = other.y - me.y;
        var dd = Math.sqrt(dx * dx + dy * dy);
        if (dd >= me.fovRadius) return false;

        var sx = Math.cos(me.r - me.fovAngle / 2);
        var sy = Math.sin(me.r - me.fovAngle / 2);
        var ex = Math.cos(me.r + me.fovAngle / 2);
        var ey = Math.sin(me.r + me.fovAngle / 2);
        if (sx * ey - ex * sy > 0) {
            if (sx * dy - dx * sy < 0) return false;
            if (ex * dy - dx * ey > 0) return false;
            return true;
        } else {
            if (sx * dy - dx * sy > 0) return true;
            if (ex * dy - dx * ey < 0) return true;
            return false;
        }
    },

    render: function(world, playerId) {
        this._ctx.clearRect(0, 0, this.width, this.height);
        this._ctx.save();
        var me = world.players[playerId];
        if (me === undefined) {
            for (var id in world.players) {
                var p = world.players[id];
                this._drawFOV(p.x, p.y, p.r, p.fovAngle, p.fovRadius, 'rgba(85, 85, 85, 0.3)');
                this._drawCircle(p.x, p.y, '#555555');
                if (p.role == 1) this._drawCross(p.x, p.y, p.r);
            }
        } else {
            for (var id in world.players) {
                var p = world.players[id];
                if (p.id !== me.id) {
                    if (this._canSee(me, p)) {
                        this._drawFOV(p.x, p.y, p.r, p.fovAngle, p.fovRadius, 'rgba(85, 85, 85, 0.3)');
                        this._drawCircle(p.x, p.y, '#555555');
                        if (p.role == 1) this._drawCross(p.x, p.y, p.r);
                    } else if (DEBUG_MODE) {
                        this._drawFOV(p.x, p.y, p.r, p.fovAngle, p.fovRadius, 'rgba(176, 176, 176, 0.3)');
                        this._drawCircle(p.x, p.y, '#aaaaaa');
                        if (p.role == 1) this._drawCross(p.x, p.y, p.r);
                    }
                } else {
                    this._drawCircle(p.x, p.y, '#ea157a');
                    this._drawFOV(p.x, p.y, p.r, p.fovAngle, p.fovRadius, 'rgba(234, 21, 122, 0.3)');
                    if (p.role == 1) this._drawCross(p.x, p.y, p.r);
                }
            }
        }
        this._ctx.restore();
    }
}

var keyCtrl = function(callback) {
    var DEBUG_KEY_CODE = 68; // 'd'
    var SPACE_KEY_CODE = 32;
    var SHIFT_KEY_CODE = 16;
    var KEYTABLE = {32: 'cw', 37: 'left', 38: 'up', 39: 'right', 40: 'down', 67: 'ccw', 86: 'cw'};
    var KEYTABLE_SHIFT = {32: 'ccw', 37: 'left', 38: 'up', 39: 'right', 40: 'down', 67: 'ccw', 86: 'cw'};
    var isSpacePressed = false;
    var prev = {};
    var sendKey = function(code, shiftStatus, status) {
        // reduce event
        if (prev.code === code && prev.shiftStatus === shiftStatus && prev.status === status)
            return;
        else {
            prev.code = code;
            prev.shiftStatus = shiftStatus;
            prev.status = status;
        }
        // send key
        var key = shiftStatus ? KEYTABLE_SHIFT[code] : KEYTABLE[code];
        if (key !== undefined)
            callback(key, status);
    };
    $(window).keydown(function(e) {
        e.preventDefault();
        sendKey(e.keyCode, e.shiftKey, true);
        // for Shift and Space combination
        if (e.keyCode === SPACE_KEY_CODE) isSpacePressed = true;
        if (e.keyCode === SHIFT_KEY_CODE && isSpacePressed) {
            sendKey(SPACE_KEY_CODE, false, false);
            sendKey(SPACE_KEY_CODE, true, true);
        }
        // for Debug
        if (e.keyCode === DEBUG_KEY_CODE) DEBUG_MODE = true;
    });
    $(window).keyup(function(e) {
        sendKey(e.keyCode, e.shiftKey, false);
        // for Shift and Space combination
        if (e.keyCode === SPACE_KEY_CODE) isSpacePressed = false;
        if (e.keyCode === SHIFT_KEY_CODE && isSpacePressed) {
            sendKey(SPACE_KEY_CODE, true, false);
            sendKey(SPACE_KEY_CODE, false, true);
        }
        // for Debug
        if (e.keyCode === DEBUG_KEY_CODE) DEBUG_MODE = false;
    });
}

var Game = function(eventId, userId) {
    if (io === undefined)
        console.e('socket.io is needed.');
    if (eventId === undefined || userId === undefined) return;

    // socket
    this.SOCKET_NAMESPACE_GAME = '/game';
    this._socket = io.connect(this.SOCKET_NAMESPACE_GAME);
    var self = this;
    this._socket.on('connected', function(msg) {
        self._onConnect.call(self, msg);
    });
    this._socket.on('joined', function(msg) {
        self._onJoined.call(self, msg);
    });
    this._socket.on('leaved', function(msg) {
        self._onLeaved.call(self, msg);
    });
    this._socket.on('update', function(msg) {
        self._onUpdate.call(self, msg);
    });;
    this._socket.on('start', function(msg) {
        self._onStart.call(self, msg);
    });;
    this._socket.on('end', function(msg) {
        self._onEnd.call(self, msg);
    });;

    // key
    keyCtrl(function(key, status) {
        self._socket.emit('key', {key: key, status: status});
    });

    this._socketId = null;
    this._eventId = eventId;
    this._userId = userId;

    this._renderer = new Renderer();

    // event listener
    this.EVENT_JOINED = 'joined';
    this.EVENT_LEAVED = 'leaved';
    this.EVENT_START = 'start';
    this.EVENT_END = 'end';
    this.EVENT_UPDATE = 'update';
    this._listener = {};
    this._listener[this.EVENT_JOINED] = [];
    this._listener[this.EVENT_LEAVED] = [];
    this._listener[this.EVENT_START] = [];
    this._listener[this.EVENT_END] = [];
    this._listener[this.EVENT_UPDATE] = [];
}

Game.prototype = {

    start: function() {
        this._socket.emit('start');
    },

    getMyScore: function() {
        // TODO : Impl
        return Math.floor(Math.random() * 100);
    },

    on: function(event, listener) {
        var list = this._listener[event];
        if (list !== undefined)
            list.push(listener);
    },

    off: function(event, listener) {
        var list = this._listener[event];
        if (list !== undefined) {
            var index = list.indexOf(listener);
            list.splice(index, 1);
        }
    },

    _trigger: function(event, data) {
        var list = this._listener[event];
        if (list !== undefined) {
            for (var i = 0, l = list.length; i < l; i++)
                list[i](data);
        }
    },

    _onConnect: function(msg) {
        this._socketId = msg.socketId;
        this._socket.emit('join', {eventId: this._eventId, userId: this._userId});
    },

    _onJoined: function(msg) {
        var joinedUserId = msg.joined.userId
        var allUserId = [];
        for (var key in msg.all) {
            allUserId.push(msg.all[key].userId);
        }
        this._trigger(this.EVENT_JOINED,
                      {joined: joinedUserId, all: allUserId})
    },

    _onLeaved: function(msg) {
        var leavedUserId = msg.leaved.userId
        var allUserId = [];
        for (var key in msg.all) {
            allUserId.push(msg.all[key].userId);
        }
        this._trigger(this.EVENT_LEAVED,
                      {leaved: leavedUserId, all: allUserId})
    },

    _onStart: function(msg) {
        this._trigger(this.EVENT_START);
    },

    _onEnd: function(msg) {
        this._trigger(this.EVENT_END);
    },

    _onUpdate: function(msg) {
        this._renderer.render.call(this._renderer, msg, this._socketId);

        var scores = {};
        for (var i in msg.players) {
            var player = msg.players[i];
            scores[player.userId] = player.score;
        }

        this._trigger(this.EVENT_UPDATE, {scores: scores, remainTime: msg.remainTime});
    }

}

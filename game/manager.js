var World = require('./world');

module.exports = {
    _worlds: {},

    getWorld: function(id) {
        if (this._worlds[id] !== undefined)
            return this._worlds[id];
        else
            return this.addWorld(id);
    },

    addWorld: function(id) {
        var world = new World(id);
        this._worlds[id] = world;
        return world;
    }
}

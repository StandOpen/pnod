function s(event, fn) {
    this._callbacks = this._callbacks || {};
    if (0 == arguments.length)
    {
        this._callbacks = {}; return this
    }
    var callbacks = this._callbacks[event];
    if (!callbacks) return this;
    
    if (1 == arguments.length)
    {
        delete this._callbacks[event];
        return this
    }
    var cb;
    for (var i = 0; i < callbacks.length; i++)
    {
        cb = callbacks[i]; if (cb === fn || cb.fn === fn)
        {
            callbacks.splice(i, 1); break
        }
    } return this
}
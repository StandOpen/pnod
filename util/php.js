//php的库才是最完美的

global.date = function (format, d) {
    if (typeof d == 'number') d = new Date(d);
    else if (!d || !d.constructor || d.constructor.name != 'Date')
        d = new Date(); 
    format = format || "Y-m-d H:i:s";
    return format.replace(/[YyMmDdHhIiSs]/ig, function ($1) {
        switch ($1) {
            case 'Y': return d.getFullYear();
            case 'y': return d.getYear();
            case 'M':  
            case 'm': return d.getMonth();
            case 'D':
            case 'd': return d.getDate();
            case 'H':
            case 'h': return d.getHours();
            case 'I':
            case 'i': return d.getMinutes();
            case 'S':
            case 's': return d.getSeconds();
            default: 
        } 
    });
}
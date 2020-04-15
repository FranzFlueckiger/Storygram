var Storygram = require('storygram');

var data = [
    { event: 1, actors: ['a', 'b', 'c'] },
    { event: 2, actors: ['d', 'b', 'e'] },
    { event: 3, actors: ['d', 'a'] }
]

var config = {
    dataFormat: 'array',
    eventField: 'event',
    actorArrayField: 'actors',
}

var storyGram = new Storygram(data, config)
storyGram.draw();

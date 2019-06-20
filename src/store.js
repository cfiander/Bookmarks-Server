
const uuid = require('uuid/v4')

const bookmarks = [
    {
        id: uuid(),
        title: 'Google',
        url: 'https://www.google.com',
        description: 'A search engine',
        rating: 4
      },
    {
        id: uuid(),
        title: 'Reddit',
        url: 'https://www.reddit.com',
        description: 'A forum website',
        rating: 5
      },
    {
        id: uuid(),
        title: 'Youtube',
        url: 'https://www.youtube.com',
        description: 'A video website',
        rating: 4
      }
]

module.exports =  { bookmarks };
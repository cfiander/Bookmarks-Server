
function makeBookmarksArray() {
    return [
      {
        id: 1,
        title: 'Website One',
        url: 'https://websiteone.com',
        description: 'website number one',
        rating: '5'
      },
      {
        id: 2,
        title: 'Website Two',
        url: 'https://websitetwo.com',
        description: 'website number two',
        rating: '4'
      },
      {
        id: 3,
        title: 'Website Three',
        url: 'https://websitethree.com',
        description: 'website number three',
        rating: '3'
      },
    ];
  }
  
  module.exports = {
    makeBookmarksArray,
  }
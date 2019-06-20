
function makeBookmarksArray() {
    return [
      {
        id: 1,
        title: 'Website One',
        url: 'https://websiteone.com',
        description: 'website number one',
        rating: 5
      },
      {
        id: 2,
        title: 'Website Two',
        url: 'https://websitetwo.com',
        description: 'website number two',
        rating: 4
      },
      {
        id: 3,
        title: 'Website Three',
        url: 'https://websitethree.com',
        description: 'website number three',
        rating: 3
      },
    ];
  }
  
  function makeMaliciousBookmark() {
    const maliciousBookmark = {
      id: 911,
      title: 'Naughty naughty very naughty <script>alert("xss");</script>',
      url: 'https://www.hackers.com',
      description: `Bad image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. But not <strong>all</strong> bad.`,
      rating: 1,
    }
    const expectedBookmark = {
      ...maliciousBookmark,
      title: 'Naughty naughty very naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;',
      description: `Bad image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.`
    }
    return {
      maliciousBookmark,
      expectedBookmark,
    }
  }
  
  module.exports = {
    makeBookmarksArray,
    makeMaliciousBookmark,
  }
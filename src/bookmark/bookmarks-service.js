const BookmarksService = {
    getAllBookmarks(knex) {
        return knex.select('*').from('bookmarks')    
    },

    getById(knex, id) {
        return knex.from('bookmarks').select('*').where('id', id).first()
      },

      deleteBookmark(db, id){
        return db('bookmarks')
          .where({ id })
          .delete();
      },
    
      insertBookmark(db, newBm){
        return db('bookmarks')
          .insert(newBm)
          .returning('*')
          .then(res=>res[0]);
      }
    };

    


module.exports = BookmarksService
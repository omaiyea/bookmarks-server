const BookmarksService = {
    getAllBookmarks(knex){
        return knex.select('*').from('bookmarks')
    },
    getBookmarkById(knex, id){
        return knex.select('*').from('bookmarks').where('id', id).first() //.first to select the first item found from the object of 1
    },
    insertBookmark(knex, bookmark){
        return knex
         .insert(bookmark)
         .into('bookmarks')
         .returning('*') //select newly added bookarmk as array
         .then(rows => {
             return rows[0] //and parse bookmark from returned object
         })
    },
    deleteBookmark(knex, bookmarkId){
        return knex('bookmarks')
         .where({bookmarkId})
         .delete()
    }
} //future: add functions to handle post/delete

module.exports = BookmarksService
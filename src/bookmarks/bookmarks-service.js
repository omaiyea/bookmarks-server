const BookmarksService = {
    getAllBookmarks(knex){
        return knex.select('*').from('bookmarks')
    },
    getBookmarkById(knex, id){
        return knex.select('*').from('bookmarks').where('id', id).first() //.first to select the first item found from the object of 1
    }
} //future: add functions to handle post/delete

module.exports = BookmarksService
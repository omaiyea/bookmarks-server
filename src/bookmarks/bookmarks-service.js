const BookmarksService = {
    getAllBookmarks(knex){
        return knex.select('*').from('bookmarks')
    }
} //future: add functions to handle post/delete

module.exports = BookmarksService
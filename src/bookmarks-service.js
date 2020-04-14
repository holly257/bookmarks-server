require 

const BookmarksService = {
    getAllBookmarks(db) {
        return db.select('*').from('bookmark_list')
    },

    //get by ID
    getById(db, id) {
        return db.select('*').from('bookmark_list')
            .where('id', id).first()
    },

    //insert
    addBookmark(db, newItem) {
        return db.insert(newItem).into('bookmark_list')
            .returning('*').then(item => {return item[0]})
    },

    //delete
    deleteBookmark(db, itemId) {
        return db.delete().from('bookmark_list').where('id', itemId)
    },

    //update
    updateItem(db, id, newInfo) {
        return db('bookmark_list').where({ id }).update(newInfo)
    }
}

module.exports = BookmarksService
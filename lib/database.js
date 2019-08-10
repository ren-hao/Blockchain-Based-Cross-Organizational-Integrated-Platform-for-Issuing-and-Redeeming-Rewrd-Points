const MongoClient = require('mongodb').MongoClient;

function Database() {
    this.connect = function(DBurl, dbName, collectionName) {
        return new Promise((resolve, reject) => {
            MongoClient.connect(DBurl, { useNewUrlParser: true }).then((client) => {
                console.log('MongoClient connected.')
                let noticeDB = client.db(dbName);
                resolve(new Collection(noticeDB.collection(collectionName)) );
            });
        });
    }
}

function Collection(mongo_collection) {
    this.insert = function(insert_obj) {
        return insert(mongo_collection, insert_obj);
    }
    this.find = function(find_obj = {}) {
        return find(mongo_collection, find_obj);
    }
    //this only return true or false
    this.contain = function(contain_obj){
        return new Promise((resolve, reject) => {
            this.find(contain_obj).then((found)=>{
                resolve(found != null ? true : false);
            });
        });
    }
    this.list = function(find_obj = {}) {
        return list(mongo_collection, find_obj);
    }
    this.delete = function(delete_obj) {
        return delete_this(mongo_collection, delete_obj);
    }
}

//use this collection ensure the first element is unique
function Collection_unique_insert(mongo_collection) {
    this.insert = function(insert_obj) {
        return unique_insert(mongo_collection, insert_obj);
    }
    this.find = function(find_obj = {}) {
        return find(mongo_collection, find_obj);
    }
    /*this.findMany = function(find_obj = {}) {
        return findMany(mongo_collection, find_obj);
    }*/
    this.contain = function(contain_obj){
        return new Promise((resolve, reject) => {
            this.find(contain_obj).then((found)=>{
                resolve(found != null ? true : false);
            });
        });
    }
    this.list = function(find_obj = {}) {
        return list(mongo_collection, find_obj);
    }
    this.delete = function(delete_obj) {
        return delete_this(mongo_collection, delete_obj);
    }
}

function unique_insert(collection, insert_obj) {
    //this function ensures every 'first element' in its collection is unique
    return new Promise((resolve, reject) => {
        let first_element_key = Object.getOwnPropertyNames(insert_obj)[0]; //
        let first_element_value = insert_obj[first_element_key];
        let sub_object = {};
        sub_object[first_element_key] = first_element_value;

        collection.update(sub_object, insert_obj, { upsert: true }, (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
}

function insert(collection, insert_obj) {
    return new Promise((resolve, reject) => {
        collection.insert(insert_obj, (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
}

function find(collection, find_obj) {
    //if not found, return null
    return new Promise((resolve, reject) => {
        collection.findOne(find_obj, (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
}

/*function findMany(collection, find_obj) {
    //if not found, return null
    return new Promise((resolve, reject) => {
        collection.find(find_obj, (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
}*/

function list(collection, find_obj) {
    return new Promise((resolve, reject) => {
        collection.find(find_obj).toArray((err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
}

function delete_this(collection, delete_obj) {
    return new Promise((resolve, reject) => {
        collection.deleteOne(delete_obj, (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
}

module.exports = Database;
var mongodb = require('./db');

function Post(username, post, time){
    this.user = username;
    this.post = post;
    if(time) {
        this.time = time;
    } else {
        this.time = new Date();
    }
};
module.exports = Post;

Post.prototype.save = function save(callback){
    // 存入mongodb文档
    var post = {
        user: this.user,
        post: this.post,
        time: this.time
    };
    mongodb.open(function(err,db){
        if(err){
            return callback(err);
        }
        // 读取posts集合
        db.collection('posts', function(err,collection){
            if (err) {
                mongodb.close();
                return callback(err);
            }
            // 为user属性添加索引
            collection.ensureIndex('user');
            // 写入post文章
            collection.insert(post, {safe:true}, function(err, psot){
                mongodb.close();
                callback(err);
            });
        });
    });
};

Post.get = function get(username, callback){
    mongodb.open(function(err, db){
        if (err) {
            return callback(err);
        }
        // 读取 posts 集合
        db.collection('posts', function(err, collection){
            if (err) {
                mongodb.close();
                return callback(err);
            }
            // 查找 user 属性为 username 的文档, 如果 usernmae 是 null 则匹配全部
            var query = {};
            if (username) {
                query.user = username;
            }
            collection.find(query).sort({time:-1}).toArray(function(err, docs){
                mongodb.close();
                if (err) {
                    callback(err, null);
                }
                // 封装 posts 为 Post 对象
                var posts = [];
                docs.forEach(function(doc, index){
                    var post = new Post(doc.user, doc.post, doc.time);
                    posts.push(post);
                });
                callback(null, posts);
            });
        });
    });
};
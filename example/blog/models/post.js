function Post(post) {
    if(post!=undefined) {
        console.log('ssss');
        this.title = post.title;
        this.content = post.content;
    }
}

module.exports = Post;

Post.getList = function *(a){
    return 'get post: '+a;
};

Post.getData = function *(){
    return 'getData asss';
}

Post.prototype.list = function *() {
    console.log(this.title);
    var t = yield  Post.getData();
    return 'test prototype'+t;
}
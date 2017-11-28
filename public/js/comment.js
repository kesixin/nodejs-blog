/**
 * Created by Administrator on 2017/8/23.
 */
var comments = [];
var page = 1;
var pages = 0;
var prepage = 10;

//评论提交
$('#messageBtn').on('click', function () {

    $.ajax({
        type: 'POST',
        url: '/api/comment/post',
        data: {
            contentId: $('#contentId').val(),
            content: $('#messageContent').val()
        },
        dataType: 'json',
        success: function (result) {
            $('#messageContent').val('');
            comments=result.data.reverse();
            renderComment();
        }
    });
});

//请求评论内容
$.ajax({
    type: 'GET',
    url: '/api/comment',
    data: {
        contentId: $('#contentId').val()
    },
    dataType: 'json',
    success: function (result) {
        comments=result.data.reverse();
        renderComment();
    }
});

/**
 * 上下页事件委托
 *
 */

$('.pager').delegate('a','click',function () {
    if($(this).parent().hasClass('previous')){
        page--;
    }else{
        page++;
    }
    renderComment();
})

function renderComment() {

    $('#messageCount').html(comments.length);
    $('.comments').html(comments.length);

    pages = Math.max(Math.ceil(comments.length / prepage), 1);
    var start = Math.max((page - 1) * prepage,0);
    var end = Math.min(page * prepage,comments.length);

    var lis = $('.pager li');
    lis.eq(1).html(page + '/' + pages);

    if (page <= 1) {
        page = 1;
        lis.eq(0).html('<span>没有上一页</span>');
    } else {
        lis.eq(0).html('<a href="javascript:;">上一页</a>');
    }

    if (page >= pages) {
        page = pages;
        lis.eq(2).html('<span>没有下一页</span>');
    } else {
        lis.eq(2).html('<a href="javascript:;">下一页</a>');
    }

    if (comments.length == 0) {
        $('.messageList').html('<div class="messageBox"><p>还没有评论</p></div>');
    } else {

        var html = '';
        for (var i = start; i < end; i++) {
            html += '<div class="messageBox">' +
                '<p class="name clear"><span class="fl">' + comments[i].username + '</span><span class="fr">' + formatTime(comments[i].postTime) + '</span></p><p>' + comments[i].content + '</p>' +
                '</div>';
        }
        $('.messageList').html(html);
    }

}

function formatTime(d) {

    var date = new Date(d);
    var month = (date.getMonth() + 1) > 9 ? (date.getMonth() + 1) : '0' + (date.getMonth() + 1);
    var day = date.getDate() > 9 ? date.getDate() : '0' + date.getDate();
    var hours = date.getHours() > 9 ? date.getHours() : '0' + date.getHours();
    var minutes = date.getMinutes() > 9 ? date.getMinutes() : '0' + date.getMinutes();
    var seconds = date.getSeconds() > 9 ? date.getSeconds() : '0' + date.getSeconds();
    return date.getFullYear() + '年' + month + '月' + day + '日 ' + hours + ':' + minutes + ':' + seconds;
}

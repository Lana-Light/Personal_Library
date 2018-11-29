$( document ).ready(function() {
  var items = [];
  var itemsRaw = [];
  
  function getJson() {
  $.getJSON('/api/books', function(data) {
    items = [];
    itemsRaw = data;
    $('#display').html('');
    $.each(data, function(i, val) {console.log('data',val);
      items.push('<li class="bookItem" id="' + i + '">' + val.title + ' - ' + val.commentcount + ' comments</li>');
      return ( i !== 14 );
    });
    if (items.length >= 15) {
      items.push('<p>...and '+ (data.length - 15)+' more!</p>');
    }
    $('<ul/>', {
      'class': 'listWrapper',
      html: items.join('')
      }).appendTo('#display');
  });
  }
  getJson();
  
  var comments = [];
 $('#display').on('click','li.bookItem',function() {
    $("#detailTitle").html('<b>'+itemsRaw[this.id].title+'</b> (id: '+itemsRaw[this.id]._id+')');
    $.getJSON('/api/books/'+itemsRaw[this.id]._id, function(data) {
      comments = [];
      $.each(data.comments, function(i, val) {
        comments.push('<li>' +val+ '</li>');
      });
      comments.push('<br><form id="newCommentForm"><input style="width:300px" type="text" class="form-control" id="commentToAdd" name="comment" placeholder="New Comment"></form>');
      comments.push('<br><button class="btn btn-info addComment" id="'+ data._id+'">Add Comment</button>');
      comments.push('<button class="btn btn-danger deleteBook" id="'+ data._id+'">Delete Book</button>');
      $('#detailComments').html(comments.join(''));
    });
  });
  
  $('#bookDetail').on('click','button.deleteBook',function() {
    $.ajax({
      url: '/api/books/'+this.id,
      type: 'delete',
      success: function(data) {
        //update list
        $('#detailComments').html('<p style="color: red;">'+data+'<p><p>Refresh the page</p>');
        getJson();
      }
    });
  });  
  
  $('#bookDetail').on('click','button.addComment',function() {
    var newComment = $('#commentToAdd').val();
    $.ajax({
      url: '/api/books/'+this.id,
      type: 'post',
      data: $('#newCommentForm').serialize(),
      success: function(data) {
        comments.unshift('<li>' + newComment + '</li>'); //adds new comment to top of list
        $('#detailComments').html(comments.join(''));
        getJson();
      }
    });
  });
  
  $("#bookTitleToAdd").on('input', function() {
    $('#newBookForm .error').text('');
  });
  
  $('#newBook').click(function(e) {
    e.preventDefault();
    $.ajax({
      url: '/api/books',
      type: 'post',
      data: $('#newBookForm').serialize(),
      success: function(data) {
        if(typeof data=='string') {
          $('#newBookForm .error').text(data);
        } else {console.log($('#newBookForm').remove);
          $('#newBookForm .error').text('');
          getJson();
        }
      }
    });
  });
  
  $('#deleteAllBooks').click(function() {
    $.ajax({
      url: '/api/books',
      type: 'delete',
      data: $('#newBookForm').serialize(),
      success: function(data) {
        //update list
        console.log('delete');
        $('#display').html('');
      }
    });
  }); 
  
});
// //get list name from url
function getUrlVars() {
    var vars = {};

    //find list var from the ?
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m, key, value) {
        vars[key] = value;
    });
    return vars;
}

//assign list to var
var list = getUrlVars().list;
//declare global data var
var data;

//replace sharepoint space escape
for (var i = 0; i < list.length; i++) {

    list = list.replace("#|%20/", " ");

}


console.log(list);


//get list data
var getList = $().SPServices.SPGetListItemsJson({
    operation: "GetListItems",
    listName: list,
    async: true,

});


//wait for the data to be returned
$.when(getList).done(function() {

    //assign data var to the returned data
    data = this.data;

    //loop through the data and paginate
    $('#pagination-container').pagination({

        //define data source
        dataSource: data,

        //limit visible items
        pageSize: 20,


        callback: function(data, pagination) {

            //define Handlebars template
            var template = Handlebars.templates.images;

            //initialise data for handle bars, make object for data to be used by handlebars
            var imagedata = {
                image: data
            };


            //pass data to handlebars template
            var compiled = template(imagedata);

            //render content to list
            $("#data-container ul").html(compiled);

            //console.log(data);
        }
    });
});

//view modal
function getID(ID) {

    //define Handlebars template
    var template = Handlebars.templates.imageView;

    //initialise data for handle bars, make object for data to be used by handlebars
    var imagedata = {
        image: data
    };

    //filter data to get element
    var imageNew = [];
    $.each(imagedata.image, function() {
        if (this.ID == ID) {
            imageNew.push(this);
        }
    });

    imageNewData = {
        image: imageNew
    };

    //pass data to handlebars template
    var compiled = template(imageNewData);

    //render content to list
    $(".gallery-item-container").html(compiled);

    //initialise comment textbox,
    var commentBox = Handlebars.templates.addcomment;
    var compiledCommentBox = commentBox(imageNewData);
    //add comment box to modal
    $(".add-comment").html(compiledCommentBox);

    //clear comments cache
    $(".comments ul").html("");

    //show modal
    $('[data-remodal-id=modal]').remodal().open();

    var views = Number(($("#" + ID + " .views span").text()));

    //update number of views
    viewit(ID, views);

    //get image comments
    getComments(ID);

}


// get comments
function getComments(imageID) {

    //fiter data with caml
    var query = '<Query>' +
        '<Where>' +
        '<And>' +
        '<Eq>' +
        '<FieldRef Name="ImageID" />' +
        '<Value Type="Number">' + imageID + '</Value>' +
        '</Eq>' +
        '<Eq>' +
        '<FieldRef Name="List_x0020_Name" />' +
        '<Value Type="Text">' + list + '</Value>' +
        '</Eq>' +
        '</And>' +
        '</Where>' +
        '</Query>';
    //get list data
    var getList = $().SPServices.SPGetListItemsJson({
        operation: "GetListItems",
        listName: "Comments",
        CAMLQuery: query,
        async: true,

    });


    //wait for the data to be returned
    $.when(getList).done(function() {

        //assign data retuned to var
        var data = this.data;
        //define Handlebars template
        if (data.length !== 0) {
            var template = Handlebars.templates.comments;

            //initialise data for handle bars, make object for data to be used by handlebars
            var commentsData = {
                comment: data
            };


            //pass data to handlebars template
            var compiled = template(commentsData);

            //render content to list
            $(".comments ul").html(compiled);

        }

        //console.log(data);

    });
}

/*=====================================
 UPDATE LIKES
 ======================================*/
function likeit(ID, Likes) {
    Likes++;
    $().SPServices({
        operation: "UpdateListItems",
        async: false,
        batchCmd: "Update",
        listName: list,
        valuepairs: [
            ["Likes", Likes]
        ],
        ID: ID,
        completefunc: function(xData, Status) {

            $("." + ID + " .likes").text(Likes);

        }
    });
}


/*=====================================
 UPDATE VIEWS
 ======================================*/
function viewit(ID, Views) {

    Views++;
    $().SPServices({
        operation: "UpdateListItems",
        async: false,
        batchCmd: "Update",
        listName: list,
        valuepairs: [
            ["Views", Views]
        ],
        ID: ID,
        completefunc: function(xData, Status) {

            $("." + ID + " .views span").text(Views);

        }
    });
}

/*=====================================
 ADD COMMENTS
 ======================================*/
function postComment(ID) {

    var id = ID;

    //console.log(ID);

    var comment = $("#commentText").val();

    $().SPServices({
        operation: "UpdateListItems",
        async: false,
        batchCmd: "New",
        listName: "Comments",
        valuepairs: [
            ["Title", comment],
            ["ImageID", id],
            ["List_x0020_Name", list],
        ],
        completefunc: function(xData, Status) {

            $(".comments ul").append('<li>' + comment + '</li>');

            console.log(comment);
            //console.log(ID);
        }
    });

}


/*=====================================
 CHECK IF COMMENT IS EMPTY OR TEXT IS TOO MUCH
 ======================================*/
function checkComment() {
    if ($("#commentText").val().length > 0) {
        var len = 225;

        if ($("#commentText").val().length >= len) {
            $("#commentText").val($("#commentText").val().substr(0, len));
            $("#charNum").text("0").css("color", "red");

        } else {
            $("#charNum").text(len - $("#commentText").val().length).css("color", "rgb(0, 133, 66)");

        }

    }
}

// add items to the "Add Items" tab

$(document).ready(function() {
  var items = [
    {
      "name" : "Red Chair",
      "image" : "https://blueprint-dev.s3.amazonaws.com/uploads/item_picture/image/739/thumbnail_tn-orange.png",
      "model" : "https://blueprint-dev.s3.amazonaws.com/uploads/item_model/model/723/ik-ekero-orange_baked.js",
      "type" : "1"
    },
    {
      "name" : "Blue Chair",
      "image" : "https://blueprint-dev.s3.amazonaws.com/uploads/item_picture/image/740/thumbnail_ekero-blue3.png",
      "model" : "https://blueprint-dev.s3.amazonaws.com/uploads/item_model/model/722/ik-ekero-blue_baked.js",
      "type" : "1"
    }
    
    {
      "name" : "Dresser - Dark Wood",
      "image" : "https://blueprint-dev.s3.amazonaws.com/uploads/item_picture/image/240/thumbnail_matera_dresser_5.png",
      "model" : "https://blueprint-dev.s3.amazonaws.com/uploads/item_model/model/189/DWR_MATERA_DRESSER2.js",
      "type" : "1"
    }

  ]



  var itemsDiv = $("#items-wrapper")
  for (var i = 0; i < items.length; i++) {
    var item = items[i];
    var html = '<div class="col-sm-4">' +
                '<a class="thumbnail add-item" model-name="' + 
                item.name + 
                '" model-url="' +
                item.model +
                '" model-type="' +
                item.type + 
                '"><img src="' +
                item.image + 
                '" alt="Add Item"> '+
                item.name +
                '</a></div>';
    itemsDiv.append(html);
  }
});
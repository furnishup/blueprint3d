// add items to the "Add Items" tab

$(document).ready(function() {
  var items = [
   {
      "name" : "Closed Door",
      "image" : "models/thumbnails/thumbnail_Screen_Shot_2014-10-27_at_8.04.12_PM.png",
      "model" : "models/js/closed-door28x80_baked.js",
      "type" : "7"
    }, 
    {
      "name" : "Open Door",
      "image" : "models/thumbnails/thumbnail_Screen_Shot_2014-10-27_at_8.22.46_PM.png",
      "model" : "models/js/open_door.js",
      "type" : "7"
    }, 
    {
      "name" : "Window",
      "image" : "models/thumbnails/thumbnail_window.png",
      "model" : "models/js/whitewindow.js",
      "type" : "3"
    }, 
    {
      "name" : "Chair",
      "image" : "models/thumbnails/thumbnail_Church-Chair-oak-white_1024x1024.jpg",
      "model" : "models/js/gus-churchchair-whiteoak.js",
      "type" : "1"
    }, 
    {
      "name" : "Red Chair",
      "image" : "models/thumbnails/thumbnail_tn-orange.png",
      "model" : "models/js/ik-ekero-orange_baked.js",
      "type" : "1"
    },
    {
      "name" : "Blue Chair",
      "image" : "models/thumbnails/thumbnail_ekero-blue3.png",
      "model" : "models/js/ik-ekero-blue_baked.js",
      "type" : "1"
    },
    {
      "name" : "Dresser - Dark Wood",
      "image" : "models/thumbnails/thumbnail_matera_dresser_5.png",
      "model" : "models/js/DWR_MATERA_DRESSER2.js",
      "type" : "1"
    }, 
    {
      "name" : "Dresser - White",
      "image" : "models/thumbnails/thumbnail_img25o.jpg",
      "model" : "models/js/we-narrow6white_baked.js",
      "type" : "1"
    },  
    {
      "name" : "Bedside table - Shale",
      "image" : "models/thumbnails/thumbnail_Blu-Dot-Shale-Bedside-Table.jpg",
      "model" : "models/js/bd-shalebedside-smoke_baked.js",
      "type" : "1"
    }, 
    {
      "name" : "Bedside table - White",
      "image" : "models/thumbnails/thumbnail_arch-white-oval-nightstand.jpg",
      "model" : "models/js/cb-archnight-white_baked.js",
      "type" : "1"
    }, 
    {
      "name" : "Wardrobe - White",
      "image" : "models/thumbnails/thumbnail_TN-ikea-kvikine.png",
      "model" : "models/js/ik-kivine_baked.js",
      "type" : "1"
    }, 
    {
      "name" : "Full Bed",
      "image" : "models/thumbnails/thumbnail_nordli-bed-frame__0159270_PE315708_S4.JPG",
      "model" : "models/js/ik_nordli_full.js",
      "type" : "1"
    }, 
    {
      "name" : "Bookshelf",
      "image" : "models/thumbnails/thumbnail_kendall-walnut-bookcase.jpg",
      "model" : "models/js/cb-kendallbookcasewalnut_baked.js",
      "type" : "1"
    }, 
        {
      "name" : "Media Console - White",
      "image" : "models/thumbnails/thumbnail_clapboard-white-60-media-console-1.jpg",
      "model" : "models/js/cb-clapboard_baked.js",
      "type" : "1"
    }, 
        {
      "name" : "Media Console - Black",
      "image" : "models/thumbnails/thumbnail_moore-60-media-console-1.jpg",
      "model" : "models/js/cb-moore_baked.js",
      "type" : "1"
    }, 
       {
      "name" : "Sectional - Olive",
      "image" : "models/thumbnails/thumbnail_img21o.jpg",
      "model" : "models/js/we-crosby2piece-greenbaked.js",
      "type" : "1"
    }, 
    {
      "name" : "Sofa - Grey",
      "image" : "models/thumbnails/thumbnail_rochelle-sofa-3.jpg",
      "model" : "models/js/cb-rochelle-gray_baked.js",
      "type" : "1"
    }, 
        {
      "name" : "Wooden Trunk",
      "image" : "models/thumbnails/thumbnail_teca-storage-trunk.jpg",
      "model" : "models/js/cb-tecs_baked.js",
      "type" : "1"
    }, 
        {
      "name" : "Floor Lamp",
      "image" : "models/thumbnails/thumbnail_ore-white.png",
      "model" : "models/js/ore-3legged-white_baked.js",
      "type" : "1"
    },
    {
      "name" : "Coffee Table - Wood",
      "image" : "models/thumbnails/thumbnail_stockholm-coffee-table__0181245_PE332924_S4.JPG",
      "model" : "models/js/ik-stockholmcoffee-brown.js",
      "type" : "1"
    }, 
    {
      "name" : "Side Table",
      "image" : "models/thumbnails/thumbnail_Screen_Shot_2014-02-21_at_1.24.58_PM.png",
      "model" : "models/js/GUSossingtonendtable.js",
      "type" : "1"
    }, 
    {
      "name" : "Dining Table",
      "image" : "models/thumbnails/thumbnail_scholar-dining-table.jpg",
      "model" : "models/js/cb-scholartable_baked.js",
      "type" : "1"
    }, 
    {
      "name" : "Dining table",
      "image" : "models/thumbnails/thumbnail_Screen_Shot_2014-01-28_at_6.49.33_PM.png",
      "model" : "models/js/BlakeAvenuejoshuatreecheftable.js",
      "type" : "1"
    },
    {
      "name" : "Blue Rug",
      "image" : "models/thumbnails/thumbnail_cb-blue-block60x96.png",
      "model" : "models/js/cb-blue-block-60x96.js",
      "type" : "8"
    },
    {
      "name" : "NYC Poster",
      "image" : "models/thumbnails/thumbnail_nyc2.jpg",
      "model" : "models/js/nyc-poster2.js",
      "type" : "2"
    }
   /*     
   {
      "name" : "",
      "image" : "",
      "model" : "",
      "type" : "1"
    }, 
    */
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
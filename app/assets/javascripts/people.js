//= require ./vendor/jquery-ui.min
//= require ./vendor/jquery.facedetection.min

(function() {
  var People;

  People = (function() {
    function People(options) {
      var defaults = {
        debug: true
      };
      this.options = $.extend(defaults, options);
      this.init();
    }

    People.prototype.init = function(){
      var _this = this;

      this.$asset = $('#people-asset');

      this.data_loaded = new $.Deferred();

      $.when(this.data_loaded).done(function() {
        _this.loadListeners();
        _this.next();
      });

      this.loadData();
    };

    People.prototype.addRegion = function(active){

      var $region = $('<div class="region"></div>');

      $('.region').removeClass('active');
      if (active) $region.addClass('active');
      this.$asset.append($region);

      $region.draggable({
        start: function(e){ e.stopPropagation(); },
        drag: function(e){ e.stopPropagation(); },
        stop: function(e){
          e.stopPropagation();
          var values = _this.getRegionData();
          values.id = $(this).attr('data-id');
          _this.submit(values, false);
        }
      }).resizable({
        start: function(e){ e.stopPropagation(); },
        resize: function(e){ e.stopPropagation(); },
        stop: function(e){
          e.stopPropagation();
          var values = _this.getRegionData();
          values.id = $(this).attr('data-id');
          _this.submit(values, false);
        }
      });

      return $region;
    };

    People.prototype.getRegionData = function(){
      var $asset = this.$asset,
          $region = $('.region.active').first(),
          assetW = $asset.width(),
          assetH = $asset.height(),
          left = $region.offset().left - $asset.offset().left,
          top = $region.offset().top - $asset.offset().top,
          x = parseFloat(left/assetW) * 100,
          y = parseFloat(top/assetH) * 100,
          w = parseFloat($region.width()/assetW) * 100,
          h = parseFloat($region.height()/assetH) * 100;

      return {x:x, y:y, w:w, h:h};
    };

    People.prototype.loadData = function(){
      var _this = this,
          url = $('#people').attr('data-url');

      this.items = [];
      this.item_count = 0;

      $.getJSON(url, function(data) {
        _.each(data, function(item){
          _this.items.push({
            url: 'http://digitalcollections.nypl.org/items/' + item.i,
            img_url: 'http://images.nypl.org/index.php?id=' + item.m + '&t=w',
            title: item.t
          });
        });
        _this.item_count = _this.items.length;
        _this.data_loaded.resolve();
        _this.options.debug && console.log('Loaded '+_this.item_count+' items');
      });
    };

    People.prototype.loadListeners = function(){
      var _this = this;

      $('.button-next').on('click', function(){
        _this.next();
      });

      var $asset = this.$asset,
          assetX = 0, assetY = 0, assetW = 0, assetH = 0,
          startX = 0, startY = 0,
          regionValue = {x: 0, y:0, w:0, h:0};

      // Starting to drag rectangle, remember start values
      $asset.hammer().bind('panstart', function(e) {
        // e.stopPropagation();
        assetX = $asset.offset().left;
        assetY = $asset.offset().top;
        assetW = $asset.width();
        assetH = $asset.height();
        var eventX = e.gesture.center.x,
            eventY = e.gesture.center.y,
            offsetX = eventX - assetX,
            offsetY = eventY - assetY;
        startX = offsetX;
        startY = offsetY;

        // add region
        _this.addRegion(true);
      });

      // Dragging rectangle, update rectangle
      $asset.hammer().bind('panmove', function(e) {
        var eventX = e.gesture.center.x,
            eventY = e.gesture.center.y,
            offsetX = eventX - assetX,
            offsetY = eventY - assetY,
            width = Math.abs(offsetX-startX),
            height = Math.abs(offsetY-startY),
            left = (offsetX - startX < 0) ? offsetX : startX,
            top = (offsetY - startY < 0) ? offsetY : startY,
            $region = $('.region.active').first();

        // update rectangle css
        $region.css({
          width: width+'px',
          height: height+'px',
          left: left+'px',
          top: top+'px'
        });
      });

      // Stopped dragging rectangle: submit coordinates/dimensions
      $asset.hammer().bind('panend', function(e) {
        var id = _.uniqueId('field_'),
            regionValue = _this.getRegionData(),
            $region = $('.region.active').first();

        // update rectangle css
        $region.css({
          width: regionValue.w+'%',
          height: regionValue.h+'%',
          left: regionValue.x+'%',
          top: regionValue.y+'%'
        }).attr('data-id', id);

        // position the field type selector
        // _this.updateFieldTypesPosition(regionValue);
      });

    };

    People.prototype.message = function(message){
      $('.message').text(message);
    };

    People.prototype.next = function(){
      var _this = this,
          rand_i = Math.floor(Math.random() * this.item_count),
          item = this.items[rand_i],
          temp_img = new Image(),
          $asset = this.$asset,
          max_w = $(window).width() * 0.9,
          max_h = $(window).height() * 0.9;

      // reset asset, add loading
      $asset.empty();
      $asset.css({
        'background-image': ''
      });
      $asset.addClass('loading');

      temp_img.onload = function(){
        _this.options.debug && console.log('Loaded image '+item.title);

        // retrieve image dimensions
        var nh = this.naturalHeight,
            nw = this.naturalWidth,
            nratio = nw / nh,
            h = nh,
            w = nw;

        // resize if too big
        if (h > max_h) {
          h = max_h;
          w = h * nratio;
        }
        if (w > max_w) {
          w = max_w;
          h = w / nratio;
        }

        // load image into ui
        $asset.removeClass('loading');
        $asset.width(w).height(h).css({
          'background-image': 'url("'+item.img_url+'")'
        });
        _this.message("Select or drag a box around a person's face");
      };
      temp_img.src = item.img_url;
    };

    People.prototype.submit = function(field, animate){
      this.options.debug && console.log('Submitting: '+field);
    };

    return People;

  })();

  $(function() {
    return new People({});
  });

}).call(this);

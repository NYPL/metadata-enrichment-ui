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

    People.prototype.activateRegion = function(id){
      $('.region').removeClass('active');
      $('.region[data-id="'+id+'"]').addClass('active');
    };

    People.prototype.addRegion = function(id, active){

      var _this = this,
          $region = $('<div class="region" data-id="'+id+'"><div class="region-form">'+
            '<div class="selections"><label>Select a name:</label><div class="selection-list"></div><label>Or:</label></div>'+
            '<form class="input"><input value="" class="input-name" placeholder="Enter a name" /></form>'+
            '<div class="links"><a href="#delete" class="delete-link">Delete this region</a></div>'+
          '</div></div>');

      // add region to ui
      this.$asset.append($region);

      // activate and update button text
      if (active) {
        this.activateRegion(id);
      }
      this.buttonText("I'm Finished");

      // make it draggable
      $region.draggable({
        start: function(e){
          e.stopPropagation();
          _this.activateRegion(id);
          _this.formHide();
        },
        drag: function(e){ e.stopPropagation(); },
        stop: function(e){
          e.stopPropagation();
          var values = _this.getRegionData();
          values.id = $(this).attr('data-id');
          _this.submit();
          _this.formShow();
        }

      // make it resizable
      }).resizable({
        start: function(e){
          e.stopPropagation();
          _this.activateRegion(id);
          _this.formHide();
        },
        resize: function(e){ e.stopPropagation(); },
        stop: function(e){
          e.stopPropagation();
          var values = _this.getRegionData();
          values.id = $(this).attr('data-id');
          _this.submit();
          _this.formShow();
        }
      });

      // click on region, make active
      $region.on('click', function(e){
        e.preventDefault();
        _this.activateRegion(id);
        _this.formShow();
      });

      // delete region link
      $region.find('.delete-link').on('click', function(e){
        e.preventDefault();
        e.stopPropagation();
        _this.deleteRegion();
      });

      // submit input form
      var $inputForm = $region.find('form.input').first();
      $inputForm.on('submit', function(e){
        e.preventDefault();
        $region.find('.selection-list button').removeClass('active');
        _this.submit(true);
      });

      this.loadFieldOptions();

      return $region;
    };

    People.prototype.buttonText = function(text){
      $('.button-next').text(text);
    };

    People.prototype.deleteRegion = function(){
      var $region = $('.region.active').first();

      $region.remove();
    };

    People.prototype.fixFormPosition = function(){
      var $region = $('.region.active').first(),
          regionData = this.getRegionData(),
          $form = $region.find('.region-form').first(),
          offset = parseFloat($region.css('border-width')),
          positions = [
            {position: 'top', value: regionData.y, styles: {left: 0, top: -$form.outerHeight()-offset, right: 'auto', bottom: 'auto'}},
            {position: 'left', value: regionData.x, styles: {left: -$form.outerWidth()-offset, top: 0, right: 'auto', bottom: 'auto'}},
            {position: 'right', value: 100-regionData.w-regionData.x, styles: {right: -$form.outerWidth()-offset, top: 0, left: 'auto', bottom: 'auto'}},
            {position: 'bottom', value: 100-regionData.h-regionData.y, styles: {left: 0, bottom: -$form.outerHeight()-offset, right: 'auto', top: 'auto'}}
          ],
          position = _.max(positions, function(p){ return p.value });

      $form.css(position.styles);
    };

    People.prototype.formHide = function(){
      $('.region.active .region-form').removeClass('active');
    };

    People.prototype.formShow = function(){
      var $form = $('.region.active .region-form');
      this.fixFormPosition();
      $form.addClass('active');
      $form.find('.input-name').first().focus();
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

    People.prototype.loadFieldOptions = function(){
      var _this = this,
          $region = $('.region.active').first(),
          $container = $region.find('.selections').first(),
          $list = $container.find('.selection-list').first(),
          names = ['Bob Smith', 'Jane Doe', 'Barbara Smith'];

      _.each(names, function(name){
        $list.append('<button>'+name+'</button>');
      });

      if (names.length > 0) {
        $container.addClass('active');
        this.message("Enter/select the person's name if known or drag a box around another face");

        // select button form
        $list.find('button').on('click', function(e){
          e.preventDefault();
          $list.find('button').removeClass('active');
          $(this).addClass('active');
          $region.find('.input-name').val($(this).text());
          _this.submit(true);
        });

      } else {
        _this.message("Enter the person's name if known or drag a box around another face");
      }

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
        e.stopPropagation();
        assetX = $asset.offset().left;
        assetY = $asset.offset().top;
        assetW = $asset.width();
        assetH = $asset.height();
        var eventX = e.gesture.center.x,
            eventY = e.gesture.center.y,
            offsetX = eventX - assetX,
            offsetY = eventY - assetY,
            id = _.uniqueId('region_');
        startX = offsetX;
        startY = offsetY;

        // add region
        _this.addRegion(id, true);
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
        var regionValue = _this.getRegionData(),
            $region = $('.region.active').first();

        // update rectangle css
        $region.css({
          width: regionValue.w+'%',
          height: regionValue.h+'%',
          left: regionValue.x+'%',
          top: regionValue.y+'%'
        });

        _this.formShow();
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
        _this.buttonText("Skip");
      };
      temp_img.src = item.img_url;
    };

    People.prototype.submit = function(animate){
      var data = this.getRegionData(),
          $region = $('.region.active').first(),
          id = $region.attr('data-id'),
          value = $region.find('.input-name').first().val();

      data.id = id;
      data.value = value;
      this.options.debug && console.log('Submitting: '+data);

      if (animate) {
        setTimeout(function(){
          $region.find('.region-form').first().animate({
            'opacity': 0
          }, 500, function(){
            $region.removeClass('active');
            $(this).css({
              'opacity': 1
            });
          });
        }, 500);
      }
    };

    return People;

  })();

  $(function() {
    return new People({});
  });

}).call(this);

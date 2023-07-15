---
---
$(function() {
  var items = {{ site.shop | jsonify }};

  $('.drag-bar').mousedown(handle_mousedown);

  function handle_mousedown(e){
    var mouse = {};
    mouse.x = e.pageX;
    mouse.y = e.pageY;
    var elem = $(this).parent().closest('div');
    var offset = $(elem).offset();
    pauseEvent(e);

    function handle_dragging(e){
        var left = offset.left + (e.pageX - mouse.x);
        var top = offset.top + (e.pageY - mouse.y);
        $(elem).offset({top: top, left: left});
        pauseEvent(e);
    }
    function handle_mouseup(e){
        $('body')
        .off('mousemove', handle_dragging)
        .off('mouseup', handle_mouseup);
    }
    $('body')
      .on('mouseup', handle_mouseup)
      .on('mousemove', handle_dragging);
  }

  // Set day
  var imgDateStr = 'weekly_img/' + new Date().getDay() + '.jpg';
  var imgDate = document.createElement('img');
  imgDate.setAttribute('src', imgDateStr);
  $(imgDate).appendTo($('#week-overlay'));

  $('.listing_images').each(function() {
    var item_name = $(this).attr('id').substring(2);
    var item_img = items.filter(function(item) {
      var itemSlug = slugify(item.name)
      if (itemSlug === item_name)
        return true;
    })[0].image;

    $(this).click(function(e) {
        var floater = document.createElement('div');
          $(floater).addClass('floater')
            .addClass('floater')
            .width(Math.random()*400+200)
            .offset({top: 0, left: 0})
            .appendTo($('body'));

        var drag = document.createElement('div');
          $(drag).addClass('drag-bar')
            .mousedown(handle_mousedown)
            .appendTo(floater);

        var close = document.createElement('img');
        close.setAttribute('src', 'img/close-01.png');
        close.setAttribute('width', '15px');
        $(close).addClass('close')
          .appendTo(drag);

        var content = document.createElement('div');
        $(content).addClass('floater-content')
          .html('<img src="' + item_img + '">')
          .appendTo(floater);

        $(close).click(function() {
          $(floater).remove();
        });
        $(floater).offset({top: e.pageY, left: e.pageX});

    });
  });

  window.updateFields = function updateFields() {
    var numItems = 0;
    var grandTotal = 0;

    for (var i = 0; i < items.length; i++) {
      var item = items[i];
      var item_slug = slugify(item.name);
      // var item_id = item.item_id;

      var quantity = $('#qty_' + item_slug).val();
      if (quantity === '' || quantity < 0)
        quantity = 0;
      quantity = Math.floor(quantity);
      $('#qty_' + item_slug).val(quantity);

      var total = quantity * item.cost;
      total = Math.round(total * 100) / 100;
      grandTotal += total;

      total = total > 0 ? total.toFixed(2) : '';
      $('#total_' + item_slug).val(total);
    }

    if (grandTotal > 0) {
      grandTotal = grandTotal.toFixed(2);
      $('#paypal-button').removeClass('inactive');
    }
    else {

      $('#paypal-button').addClass('inactive');
      grandTotal = '';
    }
    $('#grandtotal').val(grandTotal);
  }

  paypal.Button.render({

    env: 'production', // 'sandbox' or 'production',

    client: {
      sandbox:    'AXXqq8NpsoH47YrYC-E41yTj2EONqdHH7js-V6lIjlUi4-zEp8cF6kwLnPEEOvFvM0rPC3tn4v86cVfY',
      production: 'AX6fs1KuxEHsCmxuRXgjb0Rgp05p-Fn91tKK-w-DVGaSXZEibemg2AWbYTjXaCifgzejWgMqzTpLt53Z'
    },

    commit: true, // Show a 'Pay Now' button

    style: {
      label: 'checkout',
      tagline: false,
      fundingicons: true, // optional
      branding: true, // optional
      size:  'small', // small | medium | large | responsive
      shape: 'pill',   // pill | rect
      color: 'gold'   // gold | blue | silve | black
    },



    payment: function(data, actions) {
      var item_array = [];
      for (var i = 0; i < items.length; i++) {
        var item = items[i];
        var item_slug = slugify(item.name);

        var quantity = $('#qty_' + item_slug).val();

        if (quantity > 0) {
          var item_obj = {}
          item_obj.name = item.name;
          item_obj.description = item.name;
          item_obj.quantity = quantity + '';
          item_obj.price = item.cost + '';
          item_obj.tax = 0 + '';
          item_obj.currency = 'USD';

          item_array.push(item_obj);
        }
      }
      console.log(item_array);

      var total = $('#grandtotal').val();
      console.log(total);
      return actions.payment.create({
        payment: {
          intent: 'sale',
          transactions: [
            {
              amount: {
                total: total,
                currency: 'USD'
              },
              item_list: {
                items: item_array
              }
            }
          ]
        }
     });
        /*
         * Set up the payment here
         */
    },

    onAuthorize: function(data, actions) {
      return actions.payment.execute().then(function() {
        var confirm = "<h3>You've successfully made your payment!</h3>Your paypal receipt should be in your email. More details about your delivery will be sent to you in the next day or two. The product(s) will take approximately a week or two to ship. Thank you for your purchase.";
        addTextFloater(confirm);
      });
        /*
         * Execute the payment here
         */
    },

    onCancel: function(data, actions) {
        /*
         * Buyer cancelled the payment
         */
    },

    onError: function(err) {
      var error = '<h3>There was an error in processing your payment.</h3>Please try again later or contact us at <a href="mailto:heleinlinart@gmail.com">helenlinart@gmail.com</a> to troubleshoot.'
      addTextFloater(error);
        /*
         * An error occurred during the transaction
         */
    }

  }, '#paypal-button');

  function addTextFloater(text) {
    var width = Math.random()*400+200;
    var floater = document.createElement('div');
      $(floater).addClass('floater')
        .addClass('floater')
        .width(width)
        .offset({top: 0, left: 0})
        .appendTo($('body'));

    var drag = document.createElement('div');
      $(drag).addClass('drag-bar')
        .mousedown(handle_mousedown)
        .appendTo(floater);

    var close = document.createElement('img');
    close.setAttribute('src', 'img/close-01.png');
    close.setAttribute('width', '15px');
    $(close).addClass('close')
      .appendTo(drag);

    var content = document.createElement('div');
    $(content).addClass('floater-content')
      .html(text)
      .appendTo(floater);

    $(close).click(function() {
      $(floater).remove();
    });

    $(floater).offset({top: $(window).height()/2, left: $(window).width()/2-width/2});
  }

  function pauseEvent(e){
    if(e.stopPropagation) e.stopPropagation();
    if(e.preventDefault) e.preventDefault();
    e.cancelBubble=true;
    e.returnValue=false;
    return false;
  }

  // Meant to mimic Jekyll's slugify function
  // https://github.com/jekyll/jekyll/blob/master/lib/jekyll/utils.rb#L142
  function slugify (text) {
    return text.toString().toLowerCase().trim()
      .replace(/[^a-zA-Z0-9]/g, '-')  // Replace non-alphanumeric chars with -
      .replace(/\-\-+/g, '-')         // Replace multiple - with single -
      .replace(/^\-|\-$/i, '')        // Remove leading/trailing hyphen
  }
});

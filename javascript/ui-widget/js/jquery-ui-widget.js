var _window=$(window);
var browserAgent=navigator.userAgent;
var browserTest={
	isIE6: function(){
		return /msie 6/i.test(browserAgent);
	},
	isIE7: function(){
		return /msie 7/i.test(browserAgent);
	}
};


var ui = {
	/*tabbox*/
	tabbox: function (obj, motion) {
		$(obj).each(function () {
			var _obj = $(this);
			var _tabObj = _obj.find('.tabs .tab');
			var _contObj = _obj.find('.conts .cont');

			_contObj.hide();
			_contObj.first().show();
			_tabObj.first().addClass('current').next().addClass('next');

			_tabObj.on(motion, function () {
				var n = $(this).index();
				$(this).siblings().andSelf().removeClass('prev current next');
				$(this).prev().addClass('prev');
				$(this).addClass('current');
				$(this).next().addClass('next');
				_contObj.hide().eq(n).show();
			});

			if (motion == 'click') {
				_tabObj.click(function (e) {
					e.preventDefault();
				});
			};
		});

	},

	/*ellipsis*/
	wordsEllipsis: function (obj, ellipsisSymb, adjustLen) {
		adjustLen = typeof (adjustLen) == 'undefined' ? 3 : adjustLen;
		ellipsisSymb = typeof (ellipsisSymb) == 'undefined' ? '<span class="ua-ellipsissymb">…</span>' : ellipsisSymb;
		var n = 0;
		function exec(execObj) {
			if (n >= $(obj).length) { return false };
			_execObj = $(obj).eq(n);
			var objMaxHeight = parseInt(_execObj.css('max-height'));
			var objHeight = _execObj.height();
			var objLineHeight = parseInt(_execObj.css('line-height'));
			var heightFix = objHeight / objLineHeight; //lte ie7
			var wrapperClassName = 'ua-maxlen-wrapper';
			var wrapper = '<div class="' + wrapperClassName + '">';
			if (!_execObj.children('.' + wrapperClassName).is('.' + wrapperClassName)) {
				_execObj.wrapInner(wrapper);
			};
			var _wrapperObj = _execObj.children('.' + wrapperClassName);
			_wrapperObj.html(_wrapperObj.html().replace(ellipsisSymb, '').replace(/</g, '&lt;').replace(/>/g, '&gt;'));

			setTimeout(function () {
				var len = _wrapperObj.html().length;
				while (_wrapperObj.height() - heightFix > objHeight || _wrapperObj.height() - heightFix > objMaxHeight) {
					len--;
					_wrapperObj.html(_wrapperObj.html().replace(ellipsisSymb, '').substr(0, len));
					if (_wrapperObj.height() - heightFix <= objHeight || _wrapperObj.height() - heightFix <= objMaxHeight) {
						_wrapperObj.html(_wrapperObj.html().replace(ellipsisSymb, '').substr(0, len - adjustLen) + ellipsisSymb);
					};
				};
				_execObj.html(_wrapperObj.html());
				exec($(obj).eq(n++));
			}, 10);
		};
		exec($(obj).eq(n));
	},

	/*select*/
	selectStyleInit: function (obj) {
		$(obj).each(function () {

			var _obj = $(this);
			_obj.find('.current,.pointer').remove();
			_obj.prepend('<div class="current"><p class="txt"></p></div><div class="pointer"><i class="ico"></i></div>');

			var _currentObj = _obj.find('.current');
			var _currentTxtObj = _currentObj.find('.txt');
			var _itemsObj = _obj.find('.items');
			var _defaultObj = _itemsObj.find('.selected');
			var _valObj = _obj.find('input');
			var _pointerObj = _obj.find('.pointer');
			var _pointerIcoObj = _pointerObj.find('.ico');
			var effectDuration = 150;

			var width = _obj.width();
			var height = _obj.height();
			var zindex = _obj.css('z-index') || 0;
			var paddingLeft = parseInt(_obj.css('padding-left')) || 0;
			var paddingRight = parseInt(_obj.css('padding-right')) || 0;
			var borderWidthTop = parseInt(_obj.css('border-top-width')) || 0;
			var borderWidthBottom = parseInt(_obj.css('border-bottom-width')) || 0;
			var borderWidthLeft = parseInt(_obj.css('border-left-width')) || 0;
			var borderWidthRight = parseInt(_obj.css('border-right-width')) || 0;
			var pointerWidth = _currentObj.outerWidth();
			var currentPaddingLeft = parseInt(_currentObj.css('padding-left')) || 0;
			var currentPaddingRight = parseInt(_currentObj.css('padding-right')) || 0;
			var currentWidth = width - currentPaddingLeft - currentPaddingRight;
			var pointerWidth = _pointerObj.outerWidth();

			/*init*/
			var defaultValue = _defaultObj.attr('data-value');
			var defaultTxt = _defaultObj.text();

			_currentTxtObj.html(defaultTxt);
			_valObj.attr('value', defaultValue).val(defaultValue);
			_obj.css({
				'line-height': height + 'px'
			});
			_itemsObj.children(':last').addClass('last');
			_itemsObj.css({
				'top': height + 'px'
			});
			_pointerObj.css({
				'height': height + 'px'
			});
			_pointerIcoObj.css({
				'margin-top': (_pointerObj.height() - _pointerIcoObj.height()) / 2 + 'px',
				'margin-left': (_pointerObj.width() - _pointerIcoObj.width()) / 2 + 'px'
			});
			_currentObj.css({
				'width': currentWidth + 'px',
				'height': height + 'px'
			});
			_currentTxtObj.css({
				'width': currentWidth - pointerWidth + currentPaddingRight + 'px',
				'height': height + 'px',
				'line-height': height + 'px'
			});

			/*exec*/
			_itemsObj.children().off('click.ua-select').on({
				'click.ua-select':
				function () {
					var value = $(this).attr('data-value');
					var txt = $(this).text();
					_currentTxtObj.html(txt);
					_valObj.attr('value', value).val(value);
					$(this).addClass('selected').siblings().removeClass('selected');
				}
			});
			_itemsObj.children().off('mouseenter.ua-select mouseleave.ua-select').on({
				'mouseenter.ua-select':
				function () {
					$(this).addClass('hover');
				},
				'mouseleave.ua-select':
				function () {
					$(this).removeClass('hover');
				}
			});
			_obj.off('click.ua-select').on({
				'click.ua-select':
				function () {
					var itemsWidth = _itemsObj.width();
					if (itemsWidth < (width + paddingLeft + paddingLeft)) {
						_itemsObj.width(width + paddingLeft + paddingLeft);
					};
					if (!_itemsObj.is(':visible')) {
						_obj.addClass('active').css('z-index', '+=1');
						_itemsObj.slideDown(effectDuration);
					} else {
						_itemsObj.slideUp(effectDuration, function () {
							_obj.removeClass('active').css('z-index', zindex);
						});
					};
					$(obj).not(this).find('.items').slideUp(effectDuration, function () {
						$(this).closest(_obj).removeClass('active').css('z-index', zindex);
					});
				}
			});

			$(document).on('click.ua-select', function (e) {
				if (($(e.target).closest(_obj).is(_obj) || $(e.target).is(_obj)) == false) {
					$(obj).find('.items').slideUp(effectDuration, function () {
						$(this).closest(_obj).removeClass('active').css('z-index', zindex);
					});
				};
			});
		});
	},

	picLazyLoad: function (obj, loadingHTML) {
		loadingHTML = typeof (loadingHTML) == 'undefined' ? '<div>loading...</div>' : loadingHTML;
		_window.off('scroll.picLazyLoad resize.picLazyLoad');

		var _obj=$(obj);
		var _loaderObj='undefined';
		var objLen=_obj.length;
		var itemN=0;

		function loaderInit(execObj,loaderObj){
			_loaderObj.css({
				'position':'absolute'
			});
			setLoader(execObj,loaderObj);
			_loaderObj.appendTo('body');
		};
		function setLoader(execObj,loaderObj){
			loaderObj.offset({
				top:execObj.offset().top+(execObj.height()-loaderObj.height())/2,
				left:execObj.offset().left+(execObj.width()-loaderObj.width())/2
			});
		};
		function checkState(execObj,loaderObj){
			var isLoaded=false;
			var protoObj=execObj.get(0);
			var check=setInterval(function(){
				isLoaded=protoObj.complete || protoObj.readyState == 'complete' || protoObj.readyState == 'loaded';
				setLoader(execObj,loaderObj)
				if(isLoaded){
					console.log('image "'+execObj.attr('data-originsrc')+'" is loaded.');
					execObj.removeAttr('data-originsrc');
					loaderObj.fadeOut('fast',function(){
						$(this).remove();
					});
					clearInterval(check);
				};
			},300);
		};
		function changeSrc(execObj){
			console.log('image "'+execObj.attr('data-originsrc')+'" loading.');
			_loaderObj=$(loadingHTML);
			loaderInit(execObj,_loaderObj);
			setLoader(execObj,_loaderObj);
			execObj.attr('src',execObj.attr('data-originsrc'));
			checkState(execObj,_loaderObj);
		};
		function checkInRange(execObj){
			var range=_window.height()+_window.scrollTop();
			var objTop=execObj.offset().top;
			return objTop < range ? true : false;
		};
		function load(execObj) {
			var setSrc=setTimeout(function(){
				if(itemN>=objLen){
					clearTimeout(setSrc);
					return false;
				};
				execObj=_obj.eq(itemN);
				if(!checkInRange(execObj)){
					clearTimeout(setSrc);
					return false;
				};
				changeSrc(execObj);

				load(_obj.eq(itemN++));
				
			},1000);
		};

		load(_obj.eq(itemN));
		_window.on('scroll.picLazyLoad resize.picLazyLoad', function () {
			load(_obj.eq(itemN));
		});
	}

};


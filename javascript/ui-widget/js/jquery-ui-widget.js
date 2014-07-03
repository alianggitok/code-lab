(function () {

	var _window = $(window);
	var browserAgent = navigator.userAgent;
	var browserTest = {
		isIE6: function () {
			return /msie 6/i.test(browserAgent);
		},
		isIE7: function () {
			return /msie 7/i.test(browserAgent);
		}
	};


	window.ui = {
		/*vertical middle fix for ie*/
		vAlignMiddleFix: function (obj) {
			$(obj).each(function () {
				var txt = $.trim($(this).parent().text());
				var patch = '<span style="display:inline-block; font-size:0; width:0; overflow:hidden; vertical-align:middle; visibility:hidden">&nbsp;</span>';
				if (browser.isIE9() && txt == '') {
					$(this).before(patch);
				};
			});
		},

		/*tabbox*/
		tabbox: function (obj, motion) {
			$(obj).each(function () {
				var _obj = $(this),
					_tabObj = _obj.find('.tabs .tab'),
					_contObj = _obj.find('.conts .cont');

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
			var objLen=$(obj).length;
			function exec(execObj) {
				if (n >= objLen) { return false };
				_execObj = $(obj).eq(n);
				var objMaxHeight = parseInt(_execObj.css('max-height')),
					objHeight = _execObj.height(),
					objLineHeight = parseInt(_execObj.css('line-height')),
					heightFix = objHeight / objLineHeight,
					wrapperClassName = 'ua-maxlen-wrapper',
					wrapper = '<div class="' + wrapperClassName + '">';
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
							_wrapperObj.html(_wrapperObj.html().replace(ellipsisSymb, '').substr(0, len - adjustLen*2) + ellipsisSymb);
						};
					};
					_execObj.html(_wrapperObj.html());
					n++;
					exec();
				}, 10);
			};
			exec();
		},

		/*select*/
		selectStyleInit: function (obj) {
			$(obj).each(function () {

				var _obj = $(this);
				_obj.find('.current,.pointer').remove();
				_obj.prepend('<div class="current"><p class="txt"></p></div><div class="pointer"><i class="ico"></i></div>');

				var _currentObj = _obj.find('.current'),
					_currentTxtObj = _currentObj.find('.txt'),
					_itemsObj = _obj.find('.items'),
					_defaultObj = _itemsObj.find('.selected'),
					_valObj = _obj.find('input'),
					_pointerObj = _obj.find('.pointer'),
					_pointerIcoObj = _pointerObj.find('.ico'),
					effectDuration = 150;
				var width = _obj.width(),
					height = _obj.height(),
					zindex = _obj.css('z-index') || 0,
					paddingLeft = parseInt(_obj.css('padding-left')) || 0,
					paddingRight = parseInt(_obj.css('padding-right')) || 0,
					borderWidthTop = parseInt(_obj.css('border-top-width')) || 0,
					borderWidthBottom = parseInt(_obj.css('border-bottom-width')) || 0,
					borderWidthLeft = parseInt(_obj.css('border-left-width')) || 0,
					borderWidthRight = parseInt(_obj.css('border-right-width')) || 0,
					pointerWidth = _currentObj.outerWidth(),
					currentPaddingLeft = parseInt(_currentObj.css('padding-left')) || 0,
					currentPaddingRight = parseInt(_currentObj.css('padding-right')) || 0;
				var currentWidth = width - currentPaddingLeft - currentPaddingRight,
					pointerWidth = _pointerObj.outerWidth();

				/*init*/
				var defaultValue = _defaultObj.attr('data-value'),
					defaultTxt = _defaultObj.text();

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

		picLazyLoad: function (obj, loaderHTML, maskerHTML, requestSrcAttr) {
			loaderHTML = typeof (loaderHTML) == 'undefined' ? '<div>loading...</div>' : loaderHTML;
			requestSrcAttr = typeof (requestSrcAttr) == 'undefined' ? 'data-src' : requestSrcAttr;
			maskerHTML = typeof (maskerHTML) == 'undefined' ? '<div></div>' : maskerHTML;
			
			var _obj = $(obj),
				_loaderObj = '',
				_maskerObj = '',
				_execObj = '';
			var objLen = _obj.length,
				itemN = 0;
			var load = null,
				loaderSetting = null;

			function loaderInit(execObj, loaderObj, maskerObj) {
				loaderObj.css({
					'position': 'absolute'
				}).addClass('lazyload-loader').appendTo('body');
				maskerObj.css({
					'position': 'absolute',
					'z-index': loaderObj.css('z-index') - 1,
					'background': '#000',
					'opacity': '.1',
					'width': execObj.width(),
					'height': execObj.height()
				}).addClass('lazyload-masker').appendTo('body');
				setLoader(execObj, loaderObj, maskerObj);
			};
			function setLoader(execObj, loaderObj, maskerObj) {
				loaderObj.offset({
					top: execObj.offset().top + (execObj.height() - loaderObj.height()) / 2,
					left: execObj.offset().left + (execObj.width() - loaderObj.width()) / 2
				});
				maskerObj.css({
					'width': execObj.width(),
					'height': execObj.height()
				}).offset({
					top: execObj.offset().top,
					left: execObj.offset().left
				});
			};
			function removeLoader(loaderObj, maskerObj) {
				loaderObj.fadeOut('fast', function () {
					$(this).remove();
				});
				maskerObj.fadeOut('fast', function () {
					$(this).remove();
				});
			};
			function checkState(execObj, imgSrc, loaderObj, maskerObj, loaderSetting) {
				var protoObj = execObj.get(0);
				//protoObj.complete || protoObj.readyState == 'complete' || protoObj.readyState == 'loaded';
				protoObj.onload = function () {
					execObj.removeAttr(requestSrcAttr);
					clearInterval(loaderSetting);
					loaderSetting = null;
					removeLoader(loaderObj, maskerObj);
				};
				protoObj.onerror = function () {
					console.log(imgSrc + ' loading is failed.');
				};
			};
			function changeSrc(execObj, loaderObj, maskerObj) {
				//console.log('image "'+execObj.attr(requestSrcAttr)+'" loading.');
				loaderInit(execObj, loaderObj, maskerObj);
				var loaderSetting = setInterval(function () {
					setLoader(execObj, loaderObj, maskerObj);
				}, 200);
				var imgSrc = execObj.attr(requestSrcAttr);
				checkState(execObj, imgSrc, loaderObj, maskerObj, loaderSetting);
				execObj.removeAttr('src').attr('src', imgSrc).css('visibility', 'visible');
			};
			function checkInRange(execObj) {
				var range = _window.height() + _window.scrollTop(),
					objTop = execObj.offset().top;
				return objTop < range ? true : false;
			};

			function exec(execObj) {
				loadDelay = setTimeout(function () {
					if (itemN >= objLen) {
						clearTimeout(loadDelay);
						load = null;
						return false;
					};
					execObj = _obj.eq(itemN);
					if (!checkInRange(execObj)) {
						clearTimeout(loadDelay);
						load = null;
						return false;
					};
					if ($.trim(execObj.attr('src')) == '') {
						_loaderObj = $(loaderHTML);
						_maskerObj = $(maskerHTML);
						changeSrc(execObj, _loaderObj, _maskerObj);
					};
					exec(_obj.eq(itemN++));
				}, 300);
			};

			exec(_obj.eq(itemN));
			_window.off('scroll.picLazyLoad resize.picLazyLoad').on('scroll.picLazyLoad resize.picLazyLoad', function () {
				exec(_obj.eq(itemN));
			});

		}

	};


} ());

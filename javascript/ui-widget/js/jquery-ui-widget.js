(function (global) {

	var $_window = $(window),
		browserAgent = navigator.userAgent,
		browser = {
			isIE6: function () {
				return (/msie 6/i).test(browserAgent);
			},
			isIE7: function () {
				return (/msie 7/i).test(browserAgent);
			}
		};


	global.ui = {
		/*vertical middle fix for ie*/
		vAlignMiddleFix: function (obj) {
			$(obj).each(function () {
				var txt = $.trim($(this).parent().text());
				var patch = '<span style="display:inline-block; font-size:0; width:0; overflow:hidden; vertical-align:middle; visibility:hidden">&nbsp;</span>';
				if (browser.isIE9() && txt === '') {
					$(this).before(patch);
				}
			});
		},

		/*tabbox*/
		tabbox: function (obj, motion) {
			$(obj).each(function () {
				var $_obj = $(this),
					$_tabObj = $_obj.find('.tabs .tab'),
					$_contObj = $_obj.find('.conts .cont');

				$_contObj.hide();
				$_contObj.first().show();
				$_tabObj.first().addClass('current').next().addClass('next');

				$_tabObj.on(motion, function () {
					var n = $(this).index();
					$(this).siblings().andSelf().removeClass('prev current next');
					$(this).prev().addClass('prev');
					$(this).addClass('current');
					$(this).next().addClass('next');
					$_contObj.hide().eq(n).show();
				});

				if (motion === 'click') {
					$_tabObj.click(function (e) {
						e.preventDefault();
					});
				}
			});

		},

		/*ellipsis*/
		wordsEllipsis: function (obj, ellipsisSymb, adjustLen) {
			adjustLen = typeof (adjustLen) === 'undefined' ? 3 : adjustLen;
			ellipsisSymb = typeof (ellipsisSymb) === 'undefined' ? '<span class="ua-ellipsissymb">…</span>' : ellipsisSymb;
			var n = 0;
			var objLen = $(obj).length;
			function exec() {
				if (n >= objLen) { return; }
				_execObj = $(obj).eq(n);
				var objMaxHeight = parseInt(_execObj.css('max-height'), 10),
					objHeight = _execObj.height(),
					objLineHeight = parseInt(_execObj.css('line-height'), 10),
					heightFix = objHeight / objLineHeight,
					wrapperClassName = 'ua-maxlen-wrapper',
					wrapper = '<div class="' + wrapperClassName + '" style="visibility: hidden"></div>';
				if (!_execObj.children('.' + wrapperClassName).is('.' + wrapperClassName)) {
					_execObj.wrapInner(wrapper);
				}
				var _wrapperObj = _execObj.children('.' + wrapperClassName);
				_wrapperObj.html(_wrapperObj.html().replace(ellipsisSymb, '').replace(/</g, '&lt;').replace(/>/g, '&gt;'));

				setTimeout(function () {
					var len = _wrapperObj.html().length;
					while (_wrapperObj.height() - heightFix > objHeight || _wrapperObj.height() - heightFix > objMaxHeight) {
						len--;
						_wrapperObj.html(_wrapperObj.html().replace(ellipsisSymb, '').substr(0, len));
						if (_wrapperObj.height() - heightFix <= objHeight || _wrapperObj.height() - heightFix <= objMaxHeight) {
							_wrapperObj.html(_wrapperObj.html().replace(ellipsisSymb, '').substr(0, len - adjustLen*2) + ellipsisSymb);
						}
					}
					_execObj.html(_wrapperObj.html());
					n++;
					exec();
				}, 10);
			}
			exec();
		},

		/*select*/
		selector: function (obj) {
			$(obj).each(function () {

				$(this).find('.current,.pointer').remove();
				$(this).prepend('<div class="current"><p class="txt"></p></div><div class="pointer"><i class="ico"></i></div>');

				var _obj = $(this),
					_currentObj = _obj.find('.current'),
					_currentTxtObj = _currentObj.find('.txt'),
					_itemsObj = _obj.find('.items'),
					_itemObj=_itemsObj.children(),
					_defaultObj = _itemsObj.find('.selected'),
					_valObj = _obj.find('input'),
					_pointerObj = _obj.find('.pointer'),
					_pointerIcoObj = _pointerObj.find('.ico'),
					effectDuration = 150;

				var objWidth = _obj.width(),
					objHeight = _obj.height(),
					objOuterWidth = _obj.outerWidth(),
					objOuterHeight = _obj.outerHeight(),
					zIndex = _obj.css('z-index') || 0,
					objPaddingLeft = parseInt(_obj.css('padding-left'), 10) || 0,
					objBorderX=parseInt(_obj.css('border-left-width'),10)+parseInt(_obj.css('border-right-width'),10),
					currentPaddingLeft = parseInt(_currentObj.css('padding-left'),10)||0,
					currentPaddingRight = parseInt(_currentObj.css('padding-right'),10)||0,
					currentWidth=objOuterWidth-currentPaddingLeft-currentPaddingRight-objBorderX,
					pointerWidth = _pointerObj.outerWidth();
				
				/*mutationobserver*/
				function mutationObserver(observeObj,callback) {
					var mutationObserver = window.WebKitMutationObserver || window.MozMutationObserver || window.MutationObserver;
					if (mutationObserver) {
						var observer = new mutationObserver(function(){
							callback();
						});
						observer.observe(observeObj.get(0),{
							'attributes':true
						});
					}else{
						observeObj.off('propertychange.ui-selector DOMAttrModified.ui-selector').on({
							'propertychange.ui-selector DOMAttrModified.ui-selector':
							function () {
								callback();
							}
						});
					};
				};
				function reset(){
					var resetItemObj=_itemObj.filter('[data-value="'+_valObj.val()+'"]');
					if (resetItemObj.length) {
						_currentTxtObj.html(resetItemObj.text());
						resetItemObj.addClass('selected').siblings().removeClass('selected');
					}else{
						_currentTxtObj.html('请选择');
						_itemObj.removeClass('selected');
					}
				};
				if (_valObj.length>0) {
					mutationObserver(_valObj,reset);
				};

				/*init*/
				var defaultValue = _defaultObj.attr('data-value'),
					defaultTxt = _defaultObj.length<1?'请选择':_defaultObj.text();

				_currentTxtObj.html(defaultTxt);
				_valObj.attr('value', defaultValue).val(defaultValue).hide();
				_obj.css({
					'line-height': objHeight + 'px'
				});
				_itemObj.filter(':last').addClass('last');
				_itemsObj.css({
					'top': objHeight + 'px'
				});
				_pointerObj.css({
					'height': objHeight + 'px'
				});
				_pointerIcoObj.css({
					'margin-top': (_pointerObj.height() - _pointerIcoObj.height()) / 2 + 'px',
					'margin-left': (_pointerObj.width() - _pointerIcoObj.width()) / 2 + 'px'
				});
				_currentObj.css({
					'width': currentWidth + 'px',
					'height': objHeight + 'px'
				});
				_currentTxtObj.css({
					'width': currentWidth - pointerWidth+currentPaddingRight + 'px',
					'height': objHeight + 'px',
					'line-height': objHeight + 'px'
				});

				/*exec*/
				_itemObj.off('click.ui-selector').on({
					'click.ui-selector':
					function () {
						var value = $(this).attr('data-value'),
							txt = $(this).text();
						_currentTxtObj.html(txt);
						_valObj.focus().attr('value', value).val(value).focus().blur();
						$(this).addClass('selected').siblings().removeClass('selected');
					}
				});
				_itemObj.off('mouseenter.ui-selector mouseleave.ui-selector').on({
					'mouseenter.ui-selector':
					function () {
						$(this).addClass('hover');
					},
					'mouseleave.ui-selector':
					function () {
						$(this).removeClass('hover');
					}
				});
				_obj.off('click.ui-selector').on({
					'click.ui-selector':
					function () {
						var itemsWidth = _itemsObj.width();
						if (itemsWidth < (objWidth + objPaddingLeft + objPaddingLeft)) {
							_itemsObj.width(objWidth + objPaddingLeft + objPaddingLeft);
						}
						if (!_itemsObj.is(':visible')&&!_obj.is('.disabled')) {
							_obj.addClass('active').css('z-index', '+=1');
							_itemsObj.slideDown(effectDuration);
						} else {
							_itemsObj.slideUp(effectDuration, function () {
								_obj.removeClass('active').css('z-index', zIndex);
							});
						}
						$(obj).not(this).find('.items').slideUp(effectDuration, function () {
							$(this).closest(obj).removeClass('active').css('z-index', zIndex);
						});
						_valObj.focus().blur();
					}
				});

				$(document).click(function (e) {
					if (($(e.target).closest(obj).is(obj) || $(e.target).is(obj)) === false) {
						$(obj).find('.items').slideUp(effectDuration, function () {
							$(this).closest(obj).removeClass('active').css('z-index', zIndex);
						});
					}
				});
				
			});
		},

		picLazyLoad: function (obj, loaderHTML, maskerHTML, requestSrcAttr) {
			loaderHTML = typeof (loaderHTML) === 'undefined' ? '<div>loading...</div>' : loaderHTML;
			requestSrcAttr = typeof (requestSrcAttr) === 'undefined' ? 'data-src' : requestSrcAttr;
			maskerHTML = typeof (maskerHTML) === 'undefined' ? '<div></div>' : maskerHTML;
			
			var $_obj = $(obj),
				$_loaderObj = '',
				$_maskerObj = '',
				$_execObj = '';
			var objLen = $_obj.length,
				itemN = 0;
			var loadDelay = null,
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
			}
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
			}
			function removeLoader(loaderObj, maskerObj) {
				loaderObj.fadeOut('fast', function () {
					$(this).remove();
				});
				maskerObj.fadeOut('fast', function () {
					$(this).remove();
				});
			}
			function checkState(execObj, imgSrc, loaderObj, maskerObj, loaderSetting) {
				var protoObj = execObj.get(0);
				//protoObj.complete || protoObj.readyState === 'complete' || protoObj.readyState === 'loaded';
				protoObj.onload = function () {
					execObj.removeAttr(requestSrcAttr);
					clearInterval(loaderSetting);
					loaderSetting = null;
					removeLoader(loaderObj, maskerObj);
				};
				protoObj.onerror = function () {
					console.log(imgSrc + ' loading is failed.');
				};
			}
			function changeSrc(execObj, loaderObj, maskerObj) {
				//console.log('image "'+execObj.attr(requestSrcAttr)+'" loading.');
				loaderInit(execObj, loaderObj, maskerObj);
				loaderSetting = setInterval(function () {
					setLoader(execObj, loaderObj, maskerObj);
				}, 200);
				var imgSrc = execObj.attr(requestSrcAttr);
				checkState(execObj, imgSrc, loaderObj, maskerObj, loaderSetting);
				execObj.removeAttr('src').attr('src', imgSrc).css('visibility', 'visible');
			}
			function checkInRange(execObj) {
				var range = $_window.height() + $_window.scrollTop(),
					objTop = execObj.offset().top;
				return objTop < range ? true : false;
			}

			function exec() {
				loadDelay = setTimeout(function () {
					if (itemN >= objLen) {
						clearTimeout(loadDelay);
						loadDelay = null;
						return;
					}
					$_execObj = $_obj.eq(itemN);
					if (!checkInRange($_execObj)) {
						clearTimeout(loadDelay);
						loadDelay = null;
						return;
					}
					if ($.trim($_execObj.attr('src')) === '') {
						$_loaderObj = $(loaderHTML);
						$_maskerObj = $(maskerHTML);
						changeSrc($_execObj, $_loaderObj, $_maskerObj);
					}
					itemN+=1;
					exec();
				}, 300);
			}

			exec();
			$_window.off('scroll.picLazyLoad resize.picLazyLoad').on('scroll.picLazyLoad resize.picLazyLoad', function () {
				exec();
			});

		}

	};


} (window));

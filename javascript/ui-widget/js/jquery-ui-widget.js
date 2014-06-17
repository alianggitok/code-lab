var windowObj=$(window);
var browserAgent=navigator.userAgent;
var browserTest={
	isIE6: function(){
		return /msie 6/i.test(browserAgent);
	},
	isIE7: function(){
		return /msie 7/i.test(browserAgent);
	}
};


var ui={
	/*tabbox*/
	tabbox: function(obj,motion){
		$(obj).each(function() {
			var obj=$(this);
			var tabObj=obj.find('.tabs .tab');
			var contObj=obj.find('.conts .cont');
			
			contObj.hide();
			contObj.first().show();
			tabObj.first().addClass('current').next().addClass('next');
			tabObj.on(motion,function(){
				var n=$(this).index();
				$(this).siblings().andSelf().removeClass('prev current next');
				$(this).prev().addClass('prev');
				$(this).addClass('current');
				$(this).next().addClass('next');
				contObj.hide().eq(n).show();
			});
			if(motion=='click'){
				tabObj.click(function(e){
					e.preventDefault();
				});
			};
		});
			
	},

	/*ellipsis*/
	wordsEllipsis: function(obj,ellipsisSymb,adjustLen){
		adjustLen=(typeof adjustLen=='undefined'?3:adjustLen);
		ellipsisSymb=(typeof ellipsisSymb=='undefined'?'<span class="ua-ellipsissymb">…</span>':ellipsisSymb);
		var n=0;
		function exec(execObj){
			if(n>=$(obj).length){return false};
			execObj=$(obj).eq(n);
			var objMaxHeight=parseInt(execObj.css('max-height'));
			var objHeight=execObj.height();
			var objLineHeight=parseInt(execObj.css('line-height'));
			var heightFix=objHeight/objLineHeight; //lte ie7
			var wrapperClassName='ua-maxlen-wrapper';
			var wrapper='<div class="'+wrapperClassName+'">';
			if(!execObj.children('.'+wrapperClassName).is('.'+wrapperClassName)){
				execObj.wrapInner(wrapper);
			};
			var wrapperObj=execObj.children('.'+wrapperClassName);
			wrapperObj.html(wrapperObj.html().replace(ellipsisSymb,'').replace(/</g,'&lt;').replace(/>/g,'&gt;'));

			setTimeout(function(){
				var len=wrapperObj.html().length;
				while(wrapperObj.height()-heightFix>objHeight||wrapperObj.height()-heightFix>objMaxHeight){
					len--;
					wrapperObj.html(wrapperObj.html().replace(ellipsisSymb,'').substr(0,len));
					if(wrapperObj.height()-heightFix<=objHeight||wrapperObj.height()-heightFix<=objMaxHeight){
						wrapperObj.html(wrapperObj.html().replace(ellipsisSymb,'').substr(0,len-adjustLen)+ellipsisSymb);
					};
				};
				execObj.html(wrapperObj.html());
				exec($(obj).eq(n++));
			},10);
		};
		exec($(obj).eq(n));
	},
	
	/*select*/
	selectStyleInit: function(obj){
		$(obj).each(function(){
			
			$(this).find('.current,.pointer').remove();
			$(this).prepend('<div class="current"><p class="txt"></p></div><div class="pointer"><i class="ico"></i></div>');
	
			var obj=$(this);
			var currentObj=obj.find('.current');
			var currentTxtObj=currentObj.find('.txt');
			var itemsObj=obj.find('.items');
			var defaultObj=itemsObj.find('.selected');
			var valObj=obj.find('input');
			var pointerObj=obj.find('.pointer');
			var pointerIcoObj=pointerObj.find('.ico');
			var effectDuration=150;
			
			var width=obj.width();
			var height=obj.height();
			var zindex=obj.css('z-index')||0;
			var paddingLeft=parseInt(obj.css('padding-left'))||0;
			var paddingRight=parseInt(obj.css('padding-right'))||0;
			var borderWidthTop=parseInt(obj.css('border-top-width'))||0;
			var borderWidthBottom=parseInt(obj.css('border-bottom-width'))||0;
			var borderWidthLeft=parseInt(obj.css('border-left-width'))||0;
			var borderWidthRight=parseInt(obj.css('border-right-width'))||0;
			var pointerWidth=currentObj.outerWidth();
			var currentPaddingLeft=parseInt(currentObj.css('padding-left'))||0;
			var currentPaddingRight=parseInt(currentObj.css('padding-right'))||0;
			var currentWidth=width-currentPaddingLeft-currentPaddingRight;
			var pointerWidth=pointerObj.outerWidth();
			
			/*init*/
			var defaultValue=defaultObj.attr('data-value');
			var defaultTxt=defaultObj.text();
			
			currentTxtObj.html(defaultTxt);
			valObj.attr('value',defaultValue).val(defaultValue);
			obj.css({
				'line-height':height+'px'
			});
			itemsObj.children(':last').addClass('last');
			itemsObj.css({
				'top':height+'px'
			});
			pointerObj.css({
				'height':height+'px'
			});
			pointerIcoObj.css({
				'margin-top':(pointerObj.height()-pointerIcoObj.height())/2+'px',
				'margin-left':(pointerObj.width()-pointerIcoObj.width())/2+'px'
			});
			currentObj.css({
				'width':currentWidth+'px',
				'height':height+'px'
			});
			currentTxtObj.css({
				'width':currentWidth-pointerWidth+currentPaddingRight+'px',
				'height':height+'px',
				'line-height':height+'px'
			});
			
			/*exec*/
			itemsObj.children().off('click.ua-select').on({
				'click.ua-select':
				function(){
					var value=$(this).attr('data-value');
					var txt=$(this).text();
					currentTxtObj.html(txt);
					valObj.attr('value',value).val(value);
					$(this).addClass('selected').siblings().removeClass('selected');
				}
			});
			itemsObj.children().off('mouseenter.ua-select mouseleave.ua-select').on({
				'mouseenter.ua-select':
				function(){
					$(this).addClass('hover');
				},
				'mouseleave.ua-select':
				function(){
					$(this).removeClass('hover');
				}
			});
			obj.off('click.ua-select').on({
				'click.ua-select':
				function(){
					var itemsWidth=itemsObj.width();
					if(itemsWidth<(width+paddingLeft+paddingLeft)){
						itemsObj.width(width+paddingLeft+paddingLeft);
					};
					if(!itemsObj.is(':visible')){
						obj.addClass('active').css('z-index','+=1');
						itemsObj.slideDown(effectDuration);
					}else{
						itemsObj.slideUp(effectDuration,function(){
							obj.removeClass('active').css('z-index',zindex);
						});
					};
					$(obj).not(this).find('.items').slideUp(effectDuration,function(){
						$(this).closest(obj).removeClass('active').css('z-index',zindex);
					});
				}
			});
	
			$(document).on('click.ua-select',function(e){
				if(($(e.target).closest(obj).is(obj)||$(e.target).is(obj))==false){
					$(obj).find('.items').slideUp(effectDuration,function(){
						$(this).closest(obj).removeClass('active').css('z-index',zindex);
					});
				};
			});
		});
	},
	
	picLazyLoad: function (obj, loadingHTML) {
		loadingHTML=(typeof loadingHTML=='undefined'?'<div>loading...</div>':loadingHTML);
		windowObj.off('scroll.picLazyLoad');
		$(obj).each(function () {
			var obj = $(this);
			var oSrc = obj.attr('data-originsrc');
			var tmpSrc = $.trim(obj.attr('src'));
			var src = '';
			var scrollTop = 0, windowHeight = 0, objTop = 0, objLeft = 0, objWidth = 0, objHeight = 0;
			var loadingObj = $(loadingHTML);
			loadingObj.css({
				'position': 'absolute',
				'top': 0,
				'left': 0,
				'z-index': 1000
			});
			function resetAttr() {
				src = $.trim(obj.attr('src'));
				scrollTop = windowObj.scrollTop();
				windowHeight = windowObj.height();
				objTop = obj.offset().top;
				objLeft = obj.offset().left;
				objWidth = obj.width();
				objHeight = obj.height();
			};
			function loadpic() {
				resetAttr();
				if (src != tmpSrc) { return };
				//console.log(src+', '+tmpSrc);
				if ((scrollTop + windowHeight) >= objTop) {
					loadingObj.appendTo('body');
					var statecheck = setInterval(function () {
						var protoObj = obj.get(0);
						var complete = protoObj.complete || protoObj.readyState == 'complete' || protoObj.readyState == 'loaded';
						loadingObj.offset({
							top: objTop + (objHeight-loadingObj.height())/ 2,
							left: objLeft + (objWidth-loadingObj.width())/ 2
						});
						//console.log('top:' + objTop + ', ' + 'left:' + objLeft)
						if (complete) {
							loadingObj.remove();
							clearInterval(statecheck);
						};
						//console.log(protoObj.className + ', ' + complete + ', ' + 'loaded');
					}, 300);
					obj.attr('src', oSrc);
				};
			};
			loadpic();
			windowObj.on('scroll.picLazyLoad', function () {
				loadpic();
			});
		});
	}
	
};


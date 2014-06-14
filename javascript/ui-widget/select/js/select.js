var ui={
	/*sel*/
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
	}
	
};


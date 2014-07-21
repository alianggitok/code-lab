;(function ($) {

	$.fn.lightBox = function(options){
		var defaults={
				boxClass:'lightbox',
				boxWrapperClass:'wrapper',
				picHolderClass:'picholder',
				origPicSrcAttr:'href',
				navPrevHTML:'<a class="btn nav nav-prev" title="上一张"><i class="ico"></i></a>',
				navNextHTML:'<a class="btn nav nav-next" title="下一张"><i class="ico"></i></a>',
				btnCloseHTML:'<a class="btn btn-close" title="关闭"><i class="ico"></i>关闭</a>',
				refObj:window,
				effectDuration:600
			},
			opts=$.extend(defaults,options),
			boxHTML=''+
				'<div class="'+opts.boxClass+'">'+
				'	<div class="'+opts.boxWrapperClass+'">'+
				'		<div class="'+opts.picHolderClass+'">'+
				'			<img class="pic" src="#">'+
				'		</div>'+
				'		<div class="info">'+
				'			<span class="tit"></span>'+
				'			<span class="page"></span>'+
				'		</div>'+
				'	</div>'+
				'</div>',
			_box=$(boxHTML),
			_boxWrapper=_box.find('.'+opts.boxWrapperClass),
			_picHolder=_box.find('.'+opts.picHolderClass),
			_img=_picHolder.find('.pic'),
			_imgProto=_img.get(0),
			_title=_box.find('.info .tit'),
			_page=_box.find('.info .page'),
			_navPrev=$(opts.navPrevHTML),
			_navNext=$(opts.navNextHTML),
			_ref=$(opts.refObj),
			_btnClose=$(opts.btnCloseHTML),
			_trigger=$(this),
			triggerSelector=$(this).selector,
			len=_trigger.length,
			current=0,
			origPicSrc=[],
			title=[],
			checkImgStatusTimer=null,
			positionDelay=null;

		for(var i=0; i<len; i++){
			origPicSrc[i]=_trigger.eq(i).attr(opts.origPicSrcAttr);
			title[i]=_trigger.eq(i).attr('title');
		};

		console.log('===>'+$(this).selector+': \n'+triggerSelector+', \n'+title+', \n'+origPicSrc);

		function isLoaded(obj){
			return obj.complete || obj.readyState === 'complete' || obj.readyState === 'loaded';
		};
		function init(current){
			var trigger=_trigger.eq(current);
			clearInterval(checkImgStatusTimer);
			clearTimeout(positionDelay);
			_trigger.removeClass('current');
			trigger.addClass('current');
			_btnClose.appendTo(_boxWrapper);
			_navPrev.appendTo(_boxWrapper);
			_navNext.appendTo(_boxWrapper);
			_boxWrapper.children().not(_picHolder).css('display','none');
			_img.attr('src','').css('display','none');
			_box.css({
				'display':'none',
				'position': 'absolute',
				'top':trigger.offset().top,
				'left':trigger.offset().left
			}).appendTo('body');
			_picHolder.css({
				'width':trigger.width()-(_box.outerWidth()-_box.width()),
				'height':trigger.height()-(_box.outerHeight()-_box.height())
			});
			_box.stop(false,true).fadeTo(opts.effectDuration,1);
		};
		function changePic(current,callback){
			console.log(origPicSrc[current]);
			_img.attr('src',origPicSrc[current]);
			_title.html(title[current]);
			_page.html(current+1+'/'+len);
			checkImgStatusTimer=setInterval(function(){
				console.log('check');
				if(isLoaded(_imgProto)){
					callback();
					clearInterval(checkImgStatusTimer);
					checkImgStatusTimer=null;
				};
			},100);
		};
		function boxResize(){
			_img.css('display','block');
			_picHolder.stop(false,true).animate({
				'width':_img.outerWidth(),
				'height':_img.outerHeight()
			},opts.effectDuration);
		}
		function boxPosition(){
			var boxWidth=_box.outerWidth()-_picHolder.outerWidth()+_img.outerWidth(),
				boxHeight=_box.outerHeight()-_picHolder.outerHeight()+_img.outerHeight();
			_box.stop(false,true).animate({
				'left':(_ref.width()-boxWidth)/2,
				'top':(_ref.height()-boxHeight)/2
			},opts.effectDuration);
		};
		function closeBox(callback){
			_box.stop(false,true).fadeOut(opts.effectDuration,function(){
				$(this).remove();
			});
			clearInterval(checkImgStatusTimer);
			clearTimeout(positionDelay);
			$(window).off('resize.lightbox keydown.lightbox');
		};

		_trigger.on('click',function(e){
			e.preventDefault();
			current=$(this).index(triggerSelector);
			console.log(current);
			init(current);
			changePic(current,function(){
				positionDelay=setTimeout(function(){
					_boxWrapper.children().not(_picHolder).css('display','block');
					boxResize();
					boxPosition();
				},opts.effectDuration);
			});
			$(window).on({
				'resize.lightbox':
				function(){
					boxPosition();
				},
				'keydown.lightbox':
				function(e){
					var keycode=e.which||e.keyCode;
					if(keycode===27){
						closeBox();
					};
				}
			});
			_btnClose.off('click.lightbox').on({
				'click.lightbox':
				function(){
					closeBox();
				}
			});

		});



	};

} (jQuery));


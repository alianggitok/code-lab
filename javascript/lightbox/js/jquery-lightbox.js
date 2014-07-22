/*========================================================*/
//	lightbox 1.0
//	Depend on jQuery v1.7.2+
//	Code by Warren Chen on 2014-7-9
//	已知问题：当同时存在两个浮层，通过“关闭”按钮关闭其中一个后，另一个的相关操作的事件无响应（初步构想：为浮层添加current类）
/*========================================================*/

;(function ($) {

	$.fn.lightBox = function(options){
		var defaults={
				box:'.lightbox',
				boxWrapper:'.wrapper',
				picHolder:'.picholder',
				origPicSrcAttr:'href',
				navPrevHTML:'<div class="nav nav-prev"></div>',
				navNextHTML:'<div class="nav nav-next"></div>',
				btnPrevHTML:'<a class="btn" title="上一张"><i class="ico"></i>上一张</a>',
				btnNextHTML:'<a class="btn" title="下一张">下一张<i class="ico"></i></a>',
				btnCloseHTML:'<a class="btn btn-close" title="关闭"><i class="ico"></i>关闭</a>',
				refObj:window,
				effectDuration:300,
				sizeLimit:true
			},
			opts=$.extend(defaults,options),
			boxHTML=''+
				'<div class="'+opts.box.replace('.','')+'">'+
				'	<div class="'+opts.boxWrapper.replace('.','')+'">'+
				'		<div class="'+opts.picHolder.replace('.','')+'"></div>'+
				'		<div class="info">'+
				'			<div class="tit"></div>'+
				'			<div class="page"></div>'+
				'		</div>'+
				'	</div>'+
				'</div>',
			_box=$(boxHTML),
			_boxWrapper=_box.find(opts.boxWrapper),
			_picHolder=_box.find(opts.picHolder),
			_img=$('<img class="pic" src="" alt="">'),
			_imgProto=_img.get(0),
			_title=_box.find('.info .tit'),
			_page=_box.find('.info .page'),
			_prev=$(opts.navPrevHTML),
			_btnPrev=$(opts.btnPrevHTML),
			_next=$(opts.navNextHTML),
			_btnNext=$(opts.btnNextHTML),
			_btnClose=$(opts.btnCloseHTML),
			_ref=$(opts.refObj),
			_trigger=$(this),
			triggerSelector=$(this).selector,
			len=_trigger.length,
			current=0,
			origPicSrc=[],
			title=[],
			picOrigWidth=0,
			picOrigHeight=0,
			picWidth=0,
			picHeight=0,
			checkPicLoadStatus=null,
			positionDelay=null;

		for(var i=0; i<len; i++){
			origPicSrc[i]=_trigger.eq(i).attr(opts.origPicSrcAttr);
			title[i]=_trigger.eq(i).attr('title');
		};

		console.log('===>'+$(this).selector+': \n'+triggerSelector+', \n'+title+', \n'+origPicSrc);

		/********** functions **********/
		function isLoaded(obj){
			console.log(
				'checking: '+
				'[obj.complete: '+obj.complete+'], '+
				'[obj.readyState: '+obj.readyState+'], '+
				'[obj.readyState: '+obj.readyState+']'
			);
			return obj.complete || obj.readyState === 'complete' || obj.readyState === 'loaded';
		};
		function init(){
			clearInterval(checkPicLoadStatus);
			clearTimeout(positionDelay);
			_img.attr('src','');
		};
		function boxInit(current){
			init();
			var trigger=_trigger.eq(current);
			_trigger.removeClass('current');
			trigger.addClass('current');
			$(opts.box).removeClass('active');
			_box.addClass('active');
			_btnClose.appendTo(_boxWrapper);
			_prev.appendTo(_boxWrapper).append(_btnPrev);
			_next.appendTo(_boxWrapper).append(_btnNext);
			_box.css({
				'display':'none',
				'position':'absolute',
				'top':trigger.offset().top,
				'left':trigger.offset().left
			}).appendTo('body').stop(false,true).fadeTo(opts.effectDuration,1);
			var width=trigger.width()-(_box.outerWidth()-_box.width()),
				height=trigger.height()-(_box.outerHeight()-_box.height());
			_picHolder.css({
				'width':width+'px',
				'height':height+'px',
				'line-height':height+'px',
				'text-align':'center',
				'vertical-align':'middle',
				'font-size':'0'
			});
			_boxWrapper.children().not(_picHolder).css('display','none');
			_img.css({
				'display':'none',
				'vertical-align':'middle'
			}).appendTo(_picHolder);

		};
		function boxResize(picOrigWidth,picOrigHeight){
			_img.stop(false,true).show(opts.effectDuration);
			_picHolder.stop(false,true).animate({
				'width':picOrigWidth+'px',
				'height':picOrigHeight+'px',
				'line-height':picOrigHeight+'px'
			},opts.effectDuration);
		}
		function boxPosition(picOrigWidth,picOrigHeight){
			var refWidth=_ref.width(),
				refHeight=_ref.height(),
				boxWidth=_box.outerWidth()-_picHolder.outerWidth()+picOrigWidth,
				boxHeight=_box.outerHeight()-_picHolder.outerHeight()+picOrigHeight,
				boxTop=boxHeight>refHeight?0:(refHeight-boxHeight)/2,
				boxLeft=boxWidth>refWidth?0:(refWidth-boxWidth)/2;
			_box.stop(false,true).animate({
				'left':boxLeft,
				'top':boxTop
			},opts.effectDuration);
		};
		function changePic(current){
			console.log('===>'+current+': '+origPicSrc[current]);
			_img.stop(false,true).fadeOut(opts.effectDuration,function(){
				init();
				_img.attr('src',origPicSrc[current]);
				checkPicLoadStatus=setInterval(function(){
					if(isLoaded(_imgProto)){
						positionDelay=setTimeout(function(){
							picOrigWidth=_img.outerWidth();
							picOrigHeight=_img.outerHeight();
							console.log(picOrigWidth+', '+picOrigHeight);
							_boxWrapper.children().not(_picHolder).show();
							boxResize(picOrigWidth,picOrigHeight);
							boxPosition(picOrigWidth,picOrigHeight);
						},opts.effectDuration);
						clearInterval(checkPicLoadStatus);
						checkPicLoadStatus=null;
					};
				},300);
			});
			_title.html(title[current]);
			_page.html(current+1+'/'+len);
			$(window).off('resize.lightbox').on({
				'resize.lightbox':
				function(){
					boxResize(picOrigWidth,picOrigHeight);
					boxPosition(picOrigWidth,picOrigHeight);
				}
			});
			$(document).off('keydown.lightbox').on({
				'keydown.lightbox':
				function(e){
					var keyCode=e.which||e.keyCode;
					//console.log('keydown: '+keyCode);
					if(keyCode===27){
						closeBox($(opts.box));
						e.preventDefault();
					}else if(keyCode===37){
						prev();
						e.preventDefault();
					}else if(keyCode===39){
						next();
						e.preventDefault();
					};
				}
			});
			_btnClose.off('click.lightbox').on({
				'click.lightbox':
				function(){
					closeBox(_box);
				}
			});
			_btnPrev.off('click.lightbox').on({
				'click.lightbox':
				function(){
					prev();
				}
			});
			_btnNext.off('click.lightbox').on({
				'click.lightbox':
				function(){
					next();
				}
			});
		};
		function prev(){
			if(current<=0){
				return false;
			};
			changePic(current-=1);
		};
		function next(){
			if(current+1>=len){
				return false;
			};
			changePic(current+=1);
		};
		function closeBox(boxObj){
			boxObj.removeClass('active');
			//boxObj.siblings().addClass('active');
			boxObj.stop(false,true).fadeOut(opts.effectDuration,function(){
				$(this).remove();
				init();
				console.log('closed');
			});
		};

		/********** exec **********/
		_trigger.off('click.lightbox').on('click.lightbox',function(e){
			current=$(this).index(triggerSelector);
			boxInit(current);
			changePic(current);
			e.preventDefault();
		});


	};

} (jQuery));


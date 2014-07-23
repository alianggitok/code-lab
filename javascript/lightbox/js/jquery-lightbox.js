/*========================================================*/
//	lightbox 1.0
//	Depend on jQuery v1.7.2+
//	Code by Warren Chen on 2014-7-9
//	已知问题：关闭无效
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
				'		<div class="exec"></div>'+
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
		function init(){
			clearInterval(checkPicLoadStatus);
			clearTimeout(positionDelay);
		};
		function isLoaded(obj){
			console.log(
				'checking: '+
				'[obj.complete: '+obj.complete+'], '+
				'[obj.readyState: '+obj.readyState+'], '+
				'[obj.readyState: '+obj.readyState+']'
			);
			return obj.complete || obj.readyState === 'complete' || obj.readyState === 'loaded';
		};
		function boxInit(current){
			init();
			//$('html').css('overflow','hidden');
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
			var picPaddingX=_box.outerWidth()-_picHolder.width(),
				picPaddingY=_box.outerHeight()-_picHolder.height(),
				boxWidth=picPaddingX+picOrigWidth,
				boxHeight=picPaddingY+picOrigHeight,
				refWidth=_ref.width(),
				refHeight=_ref.height();
			picWidth=boxWidth>refWidth?refWidth-picPaddingX:picOrigWidth;
			picHeight=boxHeight>refHeight?refHeight-picPaddingY:picOrigHeight;
			_picHolder.stop(false,true).animate({
				'width':picWidth+'px',
				'height':picHeight+'px',
				'line-height':picHeight+'px'
			},opts.effectDuration,function(){
				//$('html').css('overflow','auto');
			});
		};
		function boxPosition(picWidth,picHeight){
			var refWidth=_ref.width(),
				refHeight=_ref.height(),
				boxWidth=_box.outerWidth()-_picHolder.outerWidth()+picWidth,
				boxHeight=_box.outerHeight()-_picHolder.outerHeight()+picHeight,
				boxTop=boxHeight>refHeight?_ref.scrollTop():(refHeight-boxHeight)/2+_ref.scrollTop(),
				boxLeft=boxWidth>refWidth?_ref.scrollLeft():(refWidth-boxWidth)/2+_ref.scrollLeft();
			_box.stop(false,true).animate({
				'left':boxLeft,
				'top':boxTop
			},opts.effectDuration);
		};
		function changePic(current){
			console.log('===>'+current+': '+origPicSrc[current]);
			_img.stop(false,true).fadeOut(opts.effectDuration,function(){
				init();
				_img.attr('src','').attr('src',origPicSrc[current]);
				checkPicLoadStatus=setInterval(function(){
					if(isLoaded(_imgProto)){
						positionDelay=setTimeout(function(){
							picOrigWidth=_img.outerWidth();
							picOrigHeight=_img.outerHeight();
							console.log(picOrigWidth+', '+picOrigHeight);
							_boxWrapper.children().not(_picHolder).show();
							boxResize(picOrigWidth,picOrigHeight);
							boxPosition(picWidth,picHeight);
						},opts.effectDuration);
						clearInterval(checkPicLoadStatus);
						checkPicLoadStatus=null;
					};
				},300);
			});
			_title.html(title[current]);
			_page.html(current+1+'/'+len);
		};
		function events(){
			$(window).off('resize.lightbox').on({
				'resize.lightbox':
				function(){
					boxResize(picOrigWidth,picOrigHeight);
					boxPosition(picWidth,picHeight);
				}
			});
			$(document).off('keydown.lightbox').on({
				'keydown.lightbox':
				function(e){
					var keyCode=e.which||e.keyCode;
					//console.log('keydown: '+keyCode);
					if(keyCode===27){
						closeBox();
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
					closeBox();
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
		function open(current){
			console.log('boxLength: '+_box.siblings(opts.box).length);
			boxInit(current);
			if(_box.siblings(opts.box).length<1){
				changePic(current);
			}else{
				closeBox(function(){
					changePic(current);
				});
			};
			events();
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
		function closeBox(callback){
			callback=typeof(callback)==='undefined'?function(){}:callback;
			var boxObj=_box.siblings(opts.box);
			boxObj.removeClass('active');
			//boxObj.siblings(opts.box).addClass('active');
			boxObj.stop(false,true).fadeOut(opts.effectDuration,function(){
				boxObj.remove();
				init();
				console.log('closed');
				callback();
			});
		};

		/********** exec **********/
		_trigger.off('click.lightbox').on('click.lightbox',function(e){
			current=$(this).index(triggerSelector);
			open(current);
			e.preventDefault();
		});


	};

} (jQuery));


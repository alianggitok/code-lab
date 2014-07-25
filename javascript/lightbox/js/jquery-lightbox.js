/*========================================================*/
//	lightbox 1.0
//	Depend on jQuery v1.7.2+
//	Code by Warren Chen on 2014-7-9
//	已知问题：导航位置调整、样式调整
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
				refPaddingFixX:10,
				refPaddingFixY:10,
				effectDuration:300,
				checkFreq:200,
				picResize:false
			},
			opts=$.extend(defaults,options),
			boxHTML=''+
				'<div class="'+opts.box.replace('.','')+'">'+
				'	<div class="'+opts.boxWrapper.replace('.','')+'">'+
				'		<div class="'+opts.picHolder.replace('.','')+'"><div class="loader"></div></div>'+
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
			_loader=_picHolder.find('.loader'),
			_title=_box.find('.info .tit'),
			_page=_box.find('.info .page'),
			_exec=_box.find('.exec'),
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
			picScaleX=1,
			picScaleY=1,
			checkPicLoadStatus=null,
			boxResizeDelay=null,
			boxPositionDelay=null,
			loadedFixDelay=null;

		for(var i=0; i<len; i++){
			origPicSrc[i]=_trigger.eq(i).attr(opts.origPicSrcAttr);
			title[i]=_trigger.eq(i).attr('title');
		};

		console.log('===>'+$(this).selector+': \n'+triggerSelector+', \n'+title+', \n'+origPicSrc);

		/********** functions **********/
		function init(){
			clearInterval(checkPicLoadStatus);
			clearTimeout(boxResizeDelay);
			clearTimeout(boxPositionDelay);
			clearTimeout(loadedFixDelay);
			_img.attr('src','');
			_img.css({
				'width':'auto',
				'height':'auto'
			});
		};
		function checkKey(key,currentKey){
			var len=key.length;
			for(var i=0; i<len; i++){
				if(currentKey===key[i]){
					return true;
				};
			};
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
			if(opts.picResize){
				$('html').css('overflow','hidden');
			};
			var trigger=_trigger.eq(current);
			_trigger.removeClass('current');
			trigger.addClass('current');
			$(opts.box).removeClass('active');
			_box.addClass('active');
			_btnClose.appendTo(_exec);
			_prev.appendTo(_boxWrapper).append(_btnPrev);
			_next.appendTo(_boxWrapper).append(_btnNext);
			_box.css({
				'display':'none',
				'position':'absolute',
				'top':trigger.offset().top,
				'left':trigger.offset().left
			}).appendTo('body');
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
				'vertical-align':'middle',
				'-ms-interpolation-mode':'bicubic'
			}).appendTo(_picHolder);
			_loader.css({
				'display':'none'
			});
		};
		function navInit(width,height){
			_prev.stop(false,true).animate({
				'width':width*.5+'px',
				'height':height+'px',
				'line-height':height+'px'
			},opts.effectDuration,function(){
				if(_prev.width()<_btnPrev.outerWidth()||_prev.height()<_btnPrev.outerHeight()){
					_btnPrev.hide();
				}else{
					_btnPrev.show();
				};
			});
			_next.stop(false,true).animate({
				'width':width*.5+'px',
				'height':height+'px',
				'line-height':height+'px'
			},opts.effectDuration,function(){
				if(_next.width()<_btnNext.outerWidth()||_next.height()<_btnNext.outerHeight()){
					_btnNext.hide();
				}else{
					_btnNext.show();
				};
			});
		};
		function boxResize(picOrigWidth,picOrigHeight){
			var picPaddingX=_box.outerWidth()-_picHolder.width(),
				picPaddingY=_box.outerHeight()-_picHolder.height(),
				boxWidth=picPaddingX+picOrigWidth,
				boxHeight=picPaddingY+picOrigHeight,
				refWidth=_ref.width()-opts.refPaddingFixX*2,
				refHeight=_ref.height()-opts.refPaddingFixY*2;
			function getWidth(){
				picWidth=refWidth-picPaddingX;
				picScaleX=picWidth/picOrigWidth;
				picHeight=picOrigHeight*picScaleX;
			};
			function getHeight(){
				picHeight=refHeight-picPaddingY;
				picScaleY=picHeight/picOrigHeight;
				picWidth=picOrigWidth*picScaleY;
			};
			if(opts.picResize){
				if(boxWidth>=refWidth){
					getWidth();
					if(picHeight>=refHeight-picPaddingY){
						getHeight();
					};
				};
				if(boxHeight>=refHeight){
					getHeight();
					if(picWidth>=refWidth-picPaddingX){
						getWidth();
					};
				};
				if(boxWidth<refWidth&&boxHeight<refHeight){
					picWidth=picOrigWidth;
					picHeight=picOrigHeight;
				};
			}else{
				picWidth=picOrigWidth;
				picHeight=picOrigHeight;
			};
			_picHolder.stop(false,true).animate({
				'width':picWidth+'px',
				'height':picHeight+'px',
				'line-height':picHeight+'px'
			},opts.effectDuration);
			_img.stop(false,true).animate({
				'width':picWidth+'px',
				'height':picHeight+'px'
			},opts.effectDuration);
			navInit(picWidth,picHeight);
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
			_loader.stop(false,true).fadeIn(opts.effectDuration);
			_trigger.removeClass('current').eq(current).addClass('current');
			_img.stop(false,true).fadeOut(opts.effectDuration,function(){
				init();
				_img.attr('src',origPicSrc[current]);
				checkPicLoadStatus=setInterval(function(){
					if(isLoaded(_imgProto)){
						loadedFixDelay=setTimeout(function(){
							picOrigWidth=picWidth=_img.outerWidth();
							picOrigHeight=picHeight=_img.outerHeight();
							console.log(picOrigWidth+', '+picOrigHeight);
							_boxWrapper.children().not(_picHolder).show();
							_loader.stop(false,true).fadeOut(opts.effectDuration);
							_img.stop(false,true).show(opts.effectDuration);
							boxResize(picOrigWidth,picOrigHeight);
							boxPosition(picWidth,picHeight);
							if(opts.picResize){
								events.refScrollBoxPosition();
							}
							events.windowResize();
							events.keyBoardNav();
							events.bindElementEvents();
						},opts.checkFreq);
						clearInterval(checkPicLoadStatus);
						checkPicLoadStatus=null;
					};
				},opts.checkFreq);
			});
			_title.html(title[current]);
			_page.html(current+1+'/'+len);
		};

		function open(current){
			boxInit(current);
			_box.stop(false,true).fadeTo(opts.effectDuration,1);
			var otherBoxs=_box.siblings(opts.box);
			if(otherBoxs.length<1){
				changePic(current);
			}else{
				close(otherBoxs,function(){
					changePic(current);
				});
			};
			events.keyBoardEsc();
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
		function close(boxObj,callback){
			boxObj=typeof(boxObj)==='undefined'?_box.siblings(opts.box).andSelf():boxObj;
			callback=typeof(callback)==='undefined'?function(){}:callback;
			boxObj.removeClass('active');
			//boxObj.prev(opts.box).addClass('active');
			events.clearEvents();
			if(opts.picResize){
				$('html').css('overflow','auto');
			};
			boxObj.stop(false,true).fadeOut(opts.effectDuration,function(){
				boxObj.remove();
				init();
				console.log('closed');
				callback();
			});
		};

		/********** events **********/
		var events={
			windowResize:function(){
				$(window).off('resize.lightbox-resize').on({
					'resize.lightbox-resize':
					function(){
						clearTimeout(boxResizeDelay);
						clearTimeout(boxPositionDelay);
						boxResizeDelay=setTimeout(function(){
							boxResize(picOrigWidth,picOrigHeight);
						},50);
						boxPositionDelay=setTimeout(function(){
							boxPosition(picWidth,picHeight);
						},50);
					}
				});
			},
			refScrollBoxPosition:function(){
				_ref.off('scroll.lightbox-boxPosition').on({
					'scroll.lightbox-boxPosition':
					function(){
						clearTimeout(boxPositionDelay);
						boxPositionDelay=setTimeout(function(){
							boxPosition(picWidth,picHeight);
						},50);
					}
				});
			},
			keyBoardNav:function(){
				$(document).off('keydown.lightbox-keyBoardNav').on({
					'keydown.lightbox-keyBoardNav':
					function(e){
						var keyCode=e.which||e.keyCode;
						if(keyCode===37){
							prev();
						}else if(keyCode===39){
							next();
						};
						if(checkKey([33,34,35,36,37,38,39,40],keyCode)){
							e.preventDefault();
						};
					}
				});
			},
			keyBoardEsc:function(){
				$(document).off('keydown.lightbox-keyBoardEsc').on({
					'keydown.lightbox-keyBoardEsc':
					function(e){
						var keyCode=e.which||e.keyCode;
						if(keyCode===27){
							close();
						};
						if(checkKey([27],keyCode)){
							e.preventDefault();
						};
					}
				});
			},
			clearEvents:function(){
				$(window).off('resize.lightbox-resize');
				_ref.off('scroll.lightbox-boxPosition');
				$(document).off('keydown.lightbox-keyBoardEsc');
				$(document).off('keydown.lightbox-keyBoardNav');
				_btnClose.off('click.lightbox');
				_btnPrev.off('click.lightbox');
				_btnNext.off('click.lightbox');
			},
			bindElementEvents:function(){
				_btnClose.off('click.lightbox').on({
					'click.lightbox':
					function(e){
						close();
						e.preventDefault();
					}
				});
				_btnPrev.off('click.lightbox').on({
					'click.lightbox':
					function(e){
						prev();
						e.preventDefault();
					}
				});
				_btnNext.off('click.lightbox').on({
					'click.lightbox':
					function(e){
						next();
						e.preventDefault();
					}
				});
			}
		};

		/********** exec **********/
		_trigger.off('click.lightbox').on('click.lightbox',function(e){
			current=$(this).index(triggerSelector);
			open(current);
			e.preventDefault();
		});


	};

} (jQuery));


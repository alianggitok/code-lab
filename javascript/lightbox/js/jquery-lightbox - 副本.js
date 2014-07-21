;(function ($) {

	$.fn.lightBox = function(options){
		var defaults={
				triggerGroup:'',
				boxClass:'lightbox',
				boxWrapperClass:'wrapper',
				picHolderClass:'picholder',
				origPicSrcAttr:'href',
				navPrevHTML:'<a class="btn nav nav-prev" title="上一张"><i class="ico"></i></a>',
				navNextHTML:'<a class="btn nav nav-next" title="下一张"><i class="ico"></i></a>',
				btnCloseHTML:'<a class="btn btn-close" title="关闭"><i class="ico"></i>关闭</a>',
				refObj:window,
				initWidth:300,
				initHeight:300,
				effectDuration:600
			},
			opts=$.extend(defaults,options);

		return this.each(function(){
			var boxHTML=''+
					'<div class="'+opts.boxClass+'">'+
					'	<div class="'+opts.boxWrapperClass+'">'+
					'		<div class="'+opts.picHolderClass+'">'+
					'			<img class="pic" src="#">'+
					'			'+opts.navPrevHTML+
					'			'+opts.navNextHTML+
					'		</div>'+
					'		<div class="info">'+
					'			<span class="tit"></span>'+
					'			<span class="page"></span>'+
					'		</div>'+
					'		'+opts.btnCloseHTML+
					'	</div>'+
					'</div>',
				_box=$(boxHTML),
				_boxWrapper=_box.find('.'+opts.boxWrapperClass),
				_picHolder=_box.find('.'+opts.picHolderClass),
				_boxImg=_picHolder.find('.pic'),
				_boxImgProto=_boxImg.get(0),
				_title=_box.find('.info .tit'),
				_page=_box.find('.info .page'),
				_navPrev=_box.find('.nav-prev'),
				_navNext=_box.find('.nav-next'),
				isLoaded=function(obj){
					return obj.complete || obj.readyState === 'complete' || obj.readyState === 'loaded';
				};

			var _ref=$(opts.refObj),
				_trigger=$(this).filter(opts.triggerGroup),
				len=_trigger.length,
				current=0,
				origPicSrc=[],
				title=[];

			for(var i=0; i<len; i++){
				origPicSrc[i]=_trigger.eq(i).attr(opts.origPicSrcAttr);
				title[i]=_trigger.eq(i).attr('title');
			};

			function boxPreLoad(current){
				_boxWrapper.children().not(_picHolder).css('display','none');
				_navPrev.css('display','none');
				_navNext.css('display','none');
				_boxImg.attr('src','').css('display','none');
				_picHolder.css({
					'width':_trigger.width(),
					'height':_trigger.height()
				});
				_box.css({
					'display':'none',
					'position': 'absolute',
					'top':_trigger.eq(current).offset().top,
					'left':_trigger.eq(current).offset().left
				}).appendTo('body');
			};
			function boxInit(callback){
				_box.stop(false,true).fadeTo(1,opts.effectDuration,function(){
					_picHolder.animate({
						'width': opts.initWidth+'px',
						'height': opts.initHeight+'px'
					},opts.effectDuration);
					_box.animate({
						'top': (_ref.outerHeight()-_box.outerHeight())/2+'px',
						'left': (_ref.outerWidth()-_box.outerWidth())/2+'px'
					},opts.effectDuration);
				});
				var check=setInterval(function(){
					if(!(_picHolder.is(':animated')&&_box.is(':animated'))){
						typeof(callback)==='undefined'?function(){}:callback();
						clearInterval(check);
						check=null;
					};
				},20);
			};
			function boxFixed(){
				var refHeight=_ref.outerHeight(),
					refWidth=_ref.outerWidth(),
					picOrigWidth=_boxImg.outerWidth(),
					picOrigHeight=_boxImg.outerHeight(),
					boxHeight=_box.outerHeight(),
					boxWidth=_box.outerWidth(),
					boxTop=(refHeight-boxHeight)/2,
					boxLeft=(refWidth-boxWidth)/2;
				_picHolder.css({
					'width':picOrigWidth+'px',
					'height':picOrigHeight+'px'
				});
				_box.css({
					'top':boxTop+'px',
					'left':boxLeft+'px'
				});
			};
			function changePic(current){
				_boxImg.attr('src',origPicSrc[current]);
				_title.html(title[current]);
				_page.html(current+1+'/'+len);
			};
			function open(current){
				boxInit(function(){
					changePic(current);
					_boxWrapper.children().not(_picHolder).show();
					var checkLoadStatusTimer = setInterval(function(){
						console.log('isload: '+isLoaded(_boxImgProto))
						if(isLoaded(_boxImgProto)){
							var boxFixedTimer = setInterval(function(){
								console.log('boxFixed');
								boxFixed();
							},20);
							_boxImg.stop(false,true).show(opts.effectDuration,function(){
								setTimeout(function(){
									clearInterval(boxFixedTimer);
									boxFixedTimer=null;
								},opts.effectDuration);
							});
							clearInterval(checkLoadStatusTimer);
							checkLoadStatusTimer=null;
						};
					},200);
				});
			};
			function close(callback){
				_box.stop(false,true).fadeOut(opts.effectDuration,function(){
					_box.remove();
					typeof(callback)==='undefined'?function(){}:callback();
				});
			};

			_trigger.on('click',function(e){
				_trigger.removeClass('current');
				$(this).addClass('current');
				current=n;
				console.log(current);
				close(function(){
					open(current);
				});
				e.preventDefault();
			});
			_navPrev.on('click',function(){
				if(current<=0){
					return false;
				};
				changePic(current-=1);
			});
			_navNext.on('click',function(){
				if(current+1>=len){
					return false;
				};
				changePic(current+=1);
			});

			$(window).off('resize.lightbox keydown.lightbox').on({
				'resize.lightbox':
				function(){
					boxFixed();
				},
				'keydown.lightbox':
				function(e){
					var keycode=e.which||e.keyCode;
					if(keycode===27){
						close();
					};
				}
			});

		});

	};

} (jQuery));


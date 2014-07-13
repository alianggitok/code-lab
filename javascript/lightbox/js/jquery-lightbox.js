//========================================================
//	uaLightBox
//	Depend on jQuery v1.7.2+
//	Code by Warren Chen
//	Create date: 2014-7-9
//========================================================

;(function ($) {

	var browserAgent = navigator.userAgent,
		browser = {
			isIE6: function () {
				return (/msie 6/i).test(browserAgent);
			},
			isIE7: function () {
				return (/msie 7/i).test(browserAgent);
			}
		};

	$.fn.lightBox = function(options){
		
		var defaults={
				triggerGroup:'',
				boxClass:'lightbox',
				boxPicClass:'picholder',
				boxWrapper:'wrapper',
				origPicSrcAttr:'href',
				navPrevHTML:'<a class="btn nav-prev" title="上一张"><i class="ico"></i></a>',
				navNextHTML:'<a class="btn nav-next" title="下一张"><i class="ico"></i></a>',
				initWidth:300,
				initHeight:300,
				effectDuration:600
			},
			opts=$.extend(defaults,options);

		return this.each(function(n){
			var boxHTML=''+
					'<div class="'+opts.boxClass+'">'+
					'	<div class="wrapper">'+
					'		<div class="'+opts.boxPicClass+'">'+
					'			<img class="pic" src="">'+
					'		</div>'+
					'		<div class="nav">'+
					'			'+opts.navPrevHTML+
					'			'+opts.navNextHTML+
					'		</div>'+
					'		<div class="info">'+
					'			<span class="tit"></span>'+
					'			<span class="page"></span>'+
					'		</div>'+
					'		<a class="btn btn-close" title="关闭"><i class="ico"></i>关闭</a>'+
					'	</div>'+
					'</div>',
				_box=$(boxHTML),
				_boxWrapper=_box.find('.'+opts.boxWrapper),
				_boxPic=_box.find('.'+opts.boxPicClass),
				_boxImg=_boxPic.find('.pic'),
				_boxImgProto=_boxImg.get(0),
				_title=_box.find('.info .tit'),
				_page=_box.find('.info .page'),
				_navPrev=_box.find('.nav .nav-prev'),
				_navNext=_box.find('.nav .nav-next'),
				isLoaded=function(){
					return _boxImgProto.complete || _boxImgProto.readyState === 'complete' || _boxImgProto.readyState === 'loaded';
				};

			var _ref=$(window),
				_trigger=$(this).filter(opts.triggerGroup),
				len=_trigger.length,
				current=n,
				bigSrc=[],
				title=[];

			for(var i=0; i<len; i++){
				bigSrc[i]=_trigger.eq(i).attr(opts.origPicSrcAttr);
				title[i]=_trigger.eq(i).attr('title');
			};

			function boxPreLoad(){
				_boxWrapper.children().not(_boxPic).css('display','none');
				_boxImg.attr('src','').css('display','none');
				_box.css({
					'display':'none',
					'position': 'absolute'
				}).appendTo('body');
			};
			function boxInit(callback){
				boxPreLoad();
				_box.stop(false,true).fadeTo(1,opts.effectDuration,function(){
					_boxPic.animate({
						'width': opts.initWidth+'px',
						'height': opts.initHeight+'px'
					},opts.effectDuration);
					_box.animate({
						'top': (_ref.outerHeight()-_box.outerHeight())/2+'px',
						'left': (_ref.outerWidth()-_box.outerWidth())/2+'px'
					},opts.effectDuration);
				});
				var check=setInterval(function(){
					if(!(_boxPic.is(':animated')&&_box.is(':animated'))){
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
				_boxPic.css({
					'width':picOrigWidth+'px',
					'height':picOrigHeight+'px'
				});
				_box.css({
					'top':boxTop+'px',
					'left':boxLeft+'px'
				});
			};
			function change(current){
				_boxImg.attr('src',bigSrc[current]);
				_title.html(title[current]);
				_page.html(current+1+'/'+len);
			};
			function open(current){
				boxInit(function(){
					change(current);
					_boxWrapper.children().not(_boxPic).show();
					var checkLoadStatusTimer = setInterval(function(){
						console.log('isload: '+isLoaded())
						if(isLoaded()){
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
				change(current-=1);
			});
			_navNext.on('click',function(){
				if(current+1>=len){
					return false;
				};
				change(current+=1);
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


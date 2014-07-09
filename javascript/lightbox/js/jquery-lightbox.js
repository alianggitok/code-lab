//========================================================
//	uaLightBox for You An Xian Pin B2B Site
//	Depend on jQuery v1.7.2+
//	Code by Warren Chen
//	Create date: 2014-7-9
//========================================================

;(function (global) {

	var browserAgent = navigator.userAgent,
		browser = {
			isIE6: function () {
				return (/msie 6/i).test(browserAgent);
			},
			isIE7: function () {
				return (/msie 7/i).test(browserAgent);
			}
		};

	/**********functions**********/

	global.uaLightBox = function(options){
		
		var defaults=({
				trigger:'.upload-pic .pic a',
				boxClass:'lightbox',
				boxPicClass:'pic',
				navPrevHTML:'<a class="btn nav-prev" title="上一张"><i class="ico"></i></a>',
				navNextHTML:'<a class="btn nav-next" title="下一张"><i class="ico"></i></a>'
			}),
			opts=$.extend(defaults,options);

		var _trigger=$(opts.trigger),
			boxHTML=''+
				'<div class="'+defaults.boxClass+'">'+
				'	<div class="'+defaults.boxPicClass+'">'+
				'		<img src="">'+
				'		'+defaults.navPrevHTML+
				'		'+defaults.navNextHTML+
				'	</div>'+
				'	<div class="info">'+
				'		<span class="tit"></span>'+
				'		<span class="page"></span>'+
				'	</div>'+
				'	<div class="exec">'+
				'		<a class="btn btn-close"></a>'+
				'	</div>'+
				'</div>';
		var _box=$(boxHTML).css('display','none'),
			_boxImg=_box.find('.'+opts.boxPicClass+' img'),
			_title=_box.find('.info .tit'),
			_page=_box.find('.info .page'),
			_navPrev=_box.find('.pic .nav-prev'),
			_navNext=_box.find('.pic .nav-next');
		
		
		_trigger.each(function(n){
			var len=_trigger.length,
				current=0,
				bigSrc={},
				title={};
			bigSrc[n]=$(this).attr('href');
			title[n]=$(this).attr('title');
			
			function change(current){
				console.log(current);
				_boxImg.attr('src',bigSrc[current]);
				_title.html(title[current]);
				_page.html(current+1+'/'+len);
			};
			
			$(this).on('click',function(e){
				console.log('start: '+n);
				console.log(bigSrc)
				current=n;
				change(current);
				_box.appendTo('body').fadeIn();
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

		});
		
	};

} (window));


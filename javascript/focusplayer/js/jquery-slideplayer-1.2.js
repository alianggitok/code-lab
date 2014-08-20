// jQuery slidePlayer v1.21
// code by Warren Chen

;(function($){
	$.fn.slidePlayer=function(options){

		/********** options **********/
		var defaults={
			obj:$(this),
			conts:'.conts ul',
			contItem:'li',
			showNav:true,
			navPrev:'.nav_prev',
			navNext:'.nav_next',
			showTabs:false,
			tabs:'.tabs ul',
			tabItem:'li',
			tabChangeFunc:'mousemove',//click,mouseenter,mousemove...
			showIntro:false,
			intro:'.intro',
			introOpacity:0.5,
			introMaskerBGColor:'#000',
			autoSwitch:true,
			autoTime:4000,
			autoStartNum:2,
			effect:'horizontal',//none,vertical,horizontal,flash,flashOverlap,spliceVertical,spliceHorizontal
			effectEasing:'linear',//linear,swing,jQuery easing's options
			effectDuration:600,
			effectWaiting:true,
			waitForLoad:true,
			checkPicStatusTime:300
		};
		var opts=$.extend(defaults,options);

		return this.each(function(objN){
			/********** initialize **********/
			var obj=opts.obj.eq(objN),
				contObj=obj.find(opts.conts),
				contItem=contObj.find(opts.contItem),
				contItemNum=contItem.length,
				contItemWidth=contItem.width(),
				contItemHeight=contItem.height(),
				tabObj=obj.find(opts.tabs),
				navObj=obj.find(opts.navPrev+','+opts.navNext),
				vCurrent=0,
				vPrevNext=0,
				currentItem=contItem.eq(vCurrent),
				prevnextItem=contItem.eq(vPrevNext),
				introObj=obj.find(opts.intro),
				introMasker=$('<div class="'+opts.intro.replace('.','')+'-masker"></div>'),
				setAutoTimer=null,
				checkPicLoadStatus=null;


			tabObj.hide();
			navObj.hide();
			contObj.css({'position':'relative'});
			contItem.css({
				'position':'absolute',
				'z-index':1,
				'margin-top':0,
				'margin-left':0
			});
			contItem.first().css('z-index',contItemNum);

			switch(opts.effect){
				case'horizontal':
					break;
				case'vertical':
					break;
				case'flash':
					contItem.hide();
					contItem.eq(vCurrent).show();
					break;
				default:
			};

			/*showTabs*/
			if(opts.showTabs){
				tabObj.show();
				tabObj.find(opts.tabItem+':first').addClass('current');
			};
			/*showNav*/
			if(opts.showNav&&contItemNum>=opts.autoStartNum){
				navObj.show();
			};
			/*intro*/
			if(opts.showIntro){
				introObj.show();
				introMasker.insertAfter(introObj).css({
					'position':'absolute',
					'width':introObj.outerWidth(),
					'height':introObj.outerHeight(),
					'background-color':opts.introMaskerBGColor
				}).fadeTo(0,opts.introOpacity);
			}else{
				introObj.hide();
			};

			/********** functions **********/
			/*effects*/
			function pointer(){
				if(vCurrent>=contItemNum){vCurrent=0};
				if(vCurrent<0){vCurrent=contItemNum-1};
				if(vPrevNext<0){vPrevNext=contItemNum-1};
				if(vPrevNext>=contItemNum){vPrevNext=0};
			};
			function tabPointer(){
				tabObj.find(opts.tabItem).removeClass("current");
				tabObj.find(opts.tabItem).eq(vCurrent).addClass("current");
			};
			function intro(){
				if(opts.showIntro){
					introMasker.css({
						'bottom':obj.outerHeight()-introObj.position().top-introObj.outerHeight()+'px',
						'left':introObj.position().left+'px',
						'width':introObj.outerWidth(),
						'height':introObj.outerHeight(),
						'z-index':introObj.css('z-index')-1
					});
					introObj.stop(false,true).slideUp(opts.effectDuration/2,function(){
						$(this).html(contItem.eq(vCurrent).find('img').attr('alt'))
						$(this).stop(false,true).slideDown(opts.effectDuration/2);
					});
					introMasker.stop(false,true).slideUp(opts.effectDuration/2,function(){
						$(this).stop(false,true).slideDown(opts.effectDuration/2);
					});
				};
			};
			intro();

			/*roll*/
			function roll(action,itemIndex){
				if(contItemNum<opts.autoStartNum){return;};
				if(opts.effectWaiting){
					if(contItem.is(':animated')){return;};
				};
				distX=contItemWidth;
				distY=contItemHeight;
				mX=distX;
				mY=distY;
				if(action=='next'){
					vCurrent++;
					vPrevNext=vCurrent-1;
				}else if(action=='prev'){
					mX=-distX;
					mY=-distY;
					vCurrent--;
					vPrevNext=vCurrent+1;
				}else if(action=='change'){
					if(itemIndex==vCurrent){return;};
					vPrevNext=vCurrent;
					if(vCurrent<itemIndex){
						vCurrent=itemIndex;
					}else if(vCurrent>itemIndex){
						mX=-distX;
						mY=-distY;
						vCurrent=itemIndex;
					};
				};
				
				pointer();
				currentItem=contItem.eq(vCurrent),
				prevnextItem=contItem.eq(vPrevNext);
				contItem.css({'z-index':1});
				prevnextItem.css({'z-index':contItemNum-1});
				currentItem.stop(true,true);
				prevnextItem.stop(true,true);
				
				function eNone(){
					currentItem.css({'z-index':contItemNum});
				};
				function eFlash(){
					contItem.not(':eq('+vCurrent+')').fadeTo(opts.effectDuration,0,opts.effectEasing);
					currentItem.css({'z-index':contItemNum}).fadeTo(opts.effectDuration,1,opts.effectEasing);
				};
				function eFlashOverlap(){
					contItem.fadeTo(opts.effectDuration,0,opts.effectEasing,function(){
						currentItem.css({'z-index':contItemNum}).fadeTo(opts.effectDuration,1,opts.effectEasing);
					});
				};
				function eHorizontal(){
					currentItem.css({'margin-left':mX,'z-index':contItemNum}).animate({'margin-left':0},opts.effectDuration,opts.effectEasing);
				};
				function eVertical(){
					currentItem.css({'margin-top':mY,'z-index':contItemNum}).animate({'margin-top':0},opts.effectDuration,opts.effectEasing);
				};
				function eSpliceHorizontal(){
					if(vCurrent>vPrevNext){distX=-contItemWidth};
					if(vCurrent==0&&vPrevNext==contItemNum-1){distX=-contItemWidth};
					if(vCurrent==contItemNum-1&&vPrevNext==0){distX=contItemWidth};
					if(vCurrent<vPrevNext&&vPrevNext-itemIndex==contItemNum-1){distX=contItemWidth};
					if(vCurrent>vPrevNext&&itemIndex-vPrevNext==contItemNum-1){distX=-contItemWidth;mX=contItemWidth};
					prevnextItem.animate({'margin-left':distX},opts.effectDuration,opts.effectEasing);
					currentItem.css({'margin-left':mX,'z-index':contItemNum}).animate({'margin-left':0},opts.effectDuration,opts.effectEasing);
				};
				function eSpliceVertical(){
					if(vCurrent>vPrevNext){distY=-contItemHeight};
					if(vCurrent==0&&vPrevNext==contItemNum-1){distY=-contItemHeight};
					if(vCurrent==contItemNum-1&&vPrevNext==0){distY=contItemHeight};
					if(vCurrent<vPrevNext&&vPrevNext-itemIndex==contItemNum-1){distY=contItemHeight};
					if(vCurrent>vPrevNext&&itemIndex-vPrevNext==contItemNum-1){distY=-contItemHeight;mY=contItemHeight};
					prevnextItem.animate({'margin-top':distY},opts.effectDuration,opts.effectEasing);
					currentItem.css({'margin-top':mY,'z-index':contItemNum}).animate({'margin-top':0},opts.effectDuration,opts.effectEasing);
				};
				
				switch(opts.effect){
					case'none':
						eNone();
						break;
					case'horizontal':
						eHorizontal();
						break;
					case'vertical':
						eVertical();
						break;
					case'flash':
						eFlash();
						break;
					case'flashOverlap':
						eFlashOverlap();
						break;
					case'spliceVertical':
						eSpliceVertical();
						break;
					case'spliceHorizontal':
						eSpliceHorizontal();
						break;
					default:
						eHorizontal();
				};

				tabPointer();
				intro();

			};
			
			/*loading status*/
			function isLoaded(obj){
				var statuses =[];
				for(var i=0,objLen=obj.length; i<objLen; i++){
					/*
					console.log(
						'checking: '+
						'[obj.get(i).complete: '+obj.get(i).complete+'], '+
						'[obj.get(i).readyState: '+obj.get(i).readyState+']'
					);
					*/
					statuses[i]=obj.get(i).complete || obj.get(i).readyState === 'complete' || obj.get(i).readyState === 'loaded';
					//console.log(statuses[i]);
				};
				//console.log(statuses.toString().search(/false/i)<0);
				return statuses.toString().search(/false/i)<0;
			};

			/*auto*/
			function autoRoll(){
				if(opts.waitForLoad){
					var status=false,
						runtime=0,
						startTime=new Date().getTime(),
						endTime=new Date().getTime();
					clearInterval(setAutoTimer);
					clearInterval(checkPicLoadStatus);
					if (contItemNum>=opts.autoStartNum){
						setAutoTimer=setInterval(function(){
							startTime=new Date().getTime();
						},opts.autoTime);
					};
					checkPicLoadStatus=setInterval(function(){
						status=isLoaded(contItem.eq(vCurrent).find('img'));
						endTime=new Date().getTime()+opts.checkPicStatusTime;
						runtime=endTime-startTime;
						//console.log('===>startTime: '+startTime+'\n    endTime:   '+endTime+'\n    ['+vCurrent+'], '+status+', '+runtime);
						if(status&&(runtime>=opts.autoTime)){
							roll('next');
						};
					},opts.checkPicStatusTime);
				}else{
					if (contItemNum>=opts.autoStartNum){
						setAutoTimer=setInterval(function(){
							roll('next');
						},opts.autoTime);
					};
				};
			};
			function stopRoll(){
				clearInterval(setAutoTimer);
				clearInterval(checkPicLoadStatus);
			};


			/********** do **********/
			if(opts.autoSwitch){
				autoRoll();
				obj.mouseenter(stopRoll).mouseleave(autoRoll);
			};

			obj.find(opts.navPrev).on('click',function(e){
				roll('prev');
				e.preventDefault();
			});
			obj.find(opts.navNext).on('click',function(e){
				roll('next');
				e.preventDefault();
			});
			tabObj.find(opts.tabItem).on(opts.tabChangeFunc,function(e){
				roll('change',$(this).index());
				e.preventDefault();
			});


		});

	};
})(jQuery);

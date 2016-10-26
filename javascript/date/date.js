var date=function(dateString){
	var DATE=new Date(dateString),
		date={
			year:DATE.getFullYear(),
			month:DATE.getMonth()+1,
			day:DATE.getDate(),
			hour:DATE.getHours(),
			minute:DATE.getMinutes(),
			seconds:DATE.getSeconds(),
			milliSeconds:DATE.getMilliseconds()
		}

	return {
		date:function(){
			return DATE;
		},
		/** 格式化日期
		 * @param {string} format - 格式化模板
		 */
		format:function(format){
			var spliters=format.match(/[\W\s]+/g),//得到分割符集合
				formats=format.match(/\w+/g),//得到日期、时间集合
				temp='',
				i=0,
				spliter=null,
				padLength=0,
				pad=function(value,padLength){//位数填补
					var padding='',
						n=0,
						len=padLength-String(value).length;
					for(n=0;n<len;n+=1){
						padding+='0';
					}
					return padding+value;//str
				};

			// console.log('spliters:',spliters);
			// console.log('formats:',formats);

			for(i=0;i<formats.length;i+=1){
				spliter=spliters[i]?spliters[i]:'';
				padLength=formats[i].length;
				switch(formats[i]){
					case 'YYYY':
						temp+=pad(date.year,padLength);
						break;
					case 'MM':
						temp+=pad(date.month,padLength);
						break;
					case 'DD':
						temp+=pad(date.day,padLength);
						break;
					case 'hh':
						temp+=pad(date.hour,padLength);
						break;
					case 'mm':
						temp+=pad(date.minute,padLength);
						break;
					case 'ss':
						temp+=pad(date.seconds,padLength);
						break;
					default:
						temp+=null;
				}
				temp+=spliter;
			}
			return temp;
		}
	}
};

var dateStr='2017/11/8';
console.log(date(dateStr).format('YYYY/MM/DD hh:mm:ss'));
console.log(date(dateStr).date());


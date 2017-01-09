/** 日期处理
 * 确保入参是有效的日期时间格式（2017/11/30、2017/11/30 00:00:00）
 * @param {String} dateString - 毫秒数、日期等规范的有效时间格式的字符类型
 * @example utils.date('2017/11/30 00:00:00').format('YYYY-MM-DD 00:00:00')
 * 			utils.date('2017/11/30')
 * 			utils.date(1023778923197)
 */
var date = function(dateString) {
	var DATE = (function(){
			return new Date(dateString);
		})(),
		date = {
			year: DATE.getFullYear(),
			month: DATE.getMonth() + 1,
			day: DATE.getDate(),
			hour: DATE.getHours(),
			minute: DATE.getMinutes(),
			seconds: DATE.getSeconds(),
			milliSeconds: DATE.getMilliseconds()
		};

	return {
		getDate: function() {
			return DATE;
		},
		/** 格式化日期
		 * @param {string} format - 格式化模板
		 */
		format: function(format) {
			var splitters = format.match(/[\W\s]+/g), //得到分割符集合
				formats = format.match(/\w+/g), //得到日期、时间集合
				temp = '',
				i = 0,
				splitter = null,
				padding = '',
				pad = function(value, padding) {//根据格式化位数填补0
					var pads = '',
						n,
						len = padding.length - String(value).length;
					if (len && String(value) !== 'NaN') {
						for (n = 0; n < len; n += 1) {
							pads += '0';
						}
					}
					return pads + value; //str
				};

			// console.log('splitters:',splitters);
			// console.log('formats:',formats);

			for (i = 0; i < formats.length; i += 1) {
				splitter = splitters[i] ? splitters[i] : '';
				padding = formats[i];
				switch (formats[i]) {
					case 'YYYY':
						temp += pad(date.year, padding);
						break;
					case 'MM':
						temp += pad(date.month, padding);
						break;
					case 'M':
						temp += date.month;
						break;
					case 'DD':
						temp += pad(date.day, padding);
						break;
					case 'D':
						temp += date.day;
						break;
					case 'hh':
						temp += pad(date.hour, padding);
						break;
					case 'h':
						temp += date.hour;
						break;
					case 'mm':
						temp += pad(date.minute, padding);
						break;
					case 'm':
						temp += date.minute;
						break;
					case 'ss':
						temp += pad(date.seconds, padding);
						break;
					case 's':
						temp += date.seconds;
						break;
					default:
						temp += null;
				}
				temp += splitter;
			}
			return temp;//返回的是string类型
		}
	}
};
var dateStr='2017/11/8';//在ie下以“-”来分割年月日的形式（“2017-11-8”）是无效的所以要用“/”分割
console.log(date(dateStr).format('YYYY/MM/DD hh:mm:ss'));
// console.log(date(dateStr).date());


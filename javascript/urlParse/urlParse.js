var urlParams=function(){
	var urlStr=window.location.href,
		paramsArr=[],
		regExp=/^.*\?+(.*)$/g,
		i,pair,key,val,
		parsedObj={};

	if(regExp.test(urlStr)){
		paramsArr=urlStr.replace(regExp,'$1').split('&');
	}

	console.log('arr:',paramsArr)

	for(i=0;i<paramsArr.length;i+=1){
		pair=paramsArr[i].split('=');
		key=pair[0];
		val=pair[1];
		parsedObj[key]=val;
	}

	return parsedObj;
};

console.log('params:',urlParams());

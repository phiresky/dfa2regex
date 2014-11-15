function randomWord(chars:string,maxLen:number) {
	var len = (Math.random()*maxLen)|0;
	var w = '';
	for(var i=0;i<len;i++) w += chars[(Math.random()*chars.length)|0];
	return w;
}

// example usage:
// compareRegex("01","(1|(0*1)|((1|(0*1))(1?|(0+1))*(1?|(0+1))))","(0|1)*1",1e6)
function compareRegex(chars:string,is:string,shouldbe:string, testcount = 1e5) {
	var isr = new RegExp("^"+is+"$");
	var shouldber = new RegExp("^"+shouldbe+"$");
	for(var i = 0; i < testcount; i++) {
		var w = randomWord(chars,20);
		var ismatch = !!isr.exec(w);
		var shouldbematch = !!shouldber.exec(w);
		if(ismatch&&!shouldbematch) throw new Error(w + " shouldn't match");
		if(!ismatch&&shouldbematch) throw new Error(w + " should match");
	}
	return "all ok";
}

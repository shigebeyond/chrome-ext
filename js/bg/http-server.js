function JkHandler(request) {
  WSC.BaseHandler.prototype.constructor.call(this)
}
_.extend(JkHandler.prototype, {
  post: function() {
    let params = this.request.bodyparams;
    let url = params['url'];
    window.open(url, "远程打开网页", "");
    
	this.setHeader('content-type','text/json')
	let buf = new TextEncoder('utf-8').encode(JSON.stringify(data)).buffer
	this.write(buf)
	this.finish()
  },
  get: function() {
	this.setHeader('content-type','text/json')
	// 输出配置选项
	let opt = read_options();
	let buf = new TextEncoder('utf-8').encode(JSON.stringify(opt)).buffer
	this.write(buf)
	this.finish()
  }
}, WSC.BaseHandler.prototype)

// 启动http server
function startHttpServer(host, port){
	chrome.runtime.getPackageDirectoryEntry(function(packageDirectory){
	  packageDirectory.getDirectory(directory,{create: false},function(webroot){
	    var fs = new WSC.FileSystem(webroot)
	    let handlers = [['/index', JkHandler],
	                ['.*', WSC.DirectoryEntryHandler.bind(null, fs)]]
		let adminServer = new WSC.WebApplication({
			host:host,
			port:port,
			handlers:handlers,
			renderIndex:true
		})
		adminServer.start()
	  });
	});
}
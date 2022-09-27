/**
 * 弹窗
 * https://www.jq22.com/yanshi22096
 * @authors liningning 原作
 * @authors shijianhang 改进
 */
function Eject(){
	var _this = this;
	// 全屏遮罩背景 -- 弹窗的容器
	var qback = $('<div class="qback"></div>');
	/*// 点击遮罩关闭弹窗, 仅首次有用
	qback.on('click',function(e){
		_this.hide()
	});*/
	// 按esc键关闭弹窗
	$(document).keydown(function (event) {
	  if (event.keyCode == 27)
	      _this.hide()
	});
	// 显示弹窗
	_this.show = function(alertBox){
		qback.append(alertBox);
		$('body').append(qback);
		alertBox.css({'marginTop':-alertBox.outerHeight()/2+'px'});
	}
	// 隐藏弹窗
	_this.hide = function(){
		qback.empty();
		qback.remove();
	}
	/* 
	alert提示窗
	modal.alert({
	    title:'alert提示文案',
		message:'这是alert弹窗，感觉还是很不错的'
	})
	或
	modal.alert('alert提示文案', '这是alert弹窗，感觉还是很不错的')
	*/
	_this.alert = function(title, msg){
		var obj;
		if(title instanceof Object){
			obj = title;
		}else{
			obj = { title:title, message:msg };
		}
		var alertBox = $('<div class="alertBox"></div>')
		var alertHead = $('<div class="alertHead">'+obj.title+'</div>')
		var alertMes = $('<div class="alertMes">'+obj.message+'</div>')
		var alertBtn = $('<span class="alertBtn">确定</span>').on('click', _this.hide)
		alertBox.append(alertHead);
		alertBox.append(alertMes);
		alertBox.append(alertBtn);
		_this.show(alertBox);
	}
	/* 
	confirm弹窗
	modal.confirm({
	      title:'confirm弹窗文案',
	      message:'这是confirm弹窗,你确定删除吗?',
	      confirm:function(){
	            alert('您点击了确定')
	      },
	      cancel:function(){
	            alert('您点击了取消')
	      }
	})
	或
	modal.confirm('confirm弹窗文案', '这是confirm弹窗,你确定删除吗?')
	如果缺少的confirm/cancel回调，可以通过收发消息机制来接收结果：消息为 modal-confirm
	*/
	_this.confirm = function(title, msg){
		var obj;
		if(title instanceof Object){
			obj = title;
		}else{
			obj = { title:title, message:msg };
		}
		var confirmBox = $('<div class="alertBox"></div>')
		var confirmHead = $('<div class="alertHead">'+obj.title+'</div>')
		var confirmMes = $('<div class="alertMes">'+obj.message+'</div>')
		var confirmBtn = $('<span class="conBtn">确定</span>').on('click',function(e){
			_this.hide();
			setTimeout(function(){
				if('confirm' in obj)
					obj.confirm();
				_this.sendConfirmMsg(true);
			},100)
		})
		var confirmcancel = $('<span class="cancel">取消</span>').on('click',function(e){
			_this.hide();
			setTimeout(function(){
				if('cancel' in obj)
					obj.cancel();
				_this.sendConfirmMsg(false);
			},100)
		})
		confirmBox.append(confirmHead);
		confirmBox.append(confirmMes);
		confirmBox.append(confirmBtn);
		confirmBox.append(confirmcancel);
		_this.show(confirmBox);
	},
	// 发送确认框的结果消息: modal-confirm
	_this.sendConfirmMsg = function(result){
		if(typeof(chrome.extension) == "undefined")
			return
		// 发消息: 通知 modal-bg.js
		publishLocalMq('modal-confirm', result)
	},
	// toast提示
	_this.toast = function(mes,time = 2){
		var timer= null;
		var toastBox = $('<div class="toastBox">'+mes+'</div>')
		_this.show(toastBox);

		// 定时关闭
		clearInterval(timer)
		timer = setInterval(function(){
			time--
			if(time<=0){
				clearInterval(timer)
				_this.hide()
			}
		},1000)
	}
/* 
	input弹窗
	modal.input({
	      title:'input弹窗文案',
	      message:'这是input弹窗,请输入参数',
	      accept:function(val){
	            alert('您输入了' + val)
	      },
	})
	或
	modal.input('input弹窗文案', '这是input弹窗,你确定删除吗?')
	如果缺少的input/cancel回调，可以通过收发消息机制来接收结果：消息为 modal-input
	*/
	_this.input = function(title, msg){
		var obj;
		if(title instanceof Object){
			obj = title;
		}else{
			obj = { title:title, message:msg };
		}
		var inputBox = $('<div class="alertBox"></div>')
		var inputHead = $('<div class="alertHead">输入弹窗</div>')
		// 输入框
		var inputMes = $('<div class="alertMes">'+obj.prefix+'<input type="text" id="input">'+obj.postfix+'</div>')
		var inputBtn = $('<span class="conBtn">确定</span>').on('click',function(e){
			let val = inputMes.find('#input').val()
			if('accept' in obj)
				obj.accept(val);
			_this.hide();
		})
		var inputcancel = $('<span class="cancel">取消</span>').on('click', _this.hide)
		inputBox.append(inputHead);
		inputBox.append(inputMes);
		inputBox.append(inputBtn);
		inputBox.append(inputcancel);
		_this.show(inputBox);
	},
}

// 实例化
var modal = new Eject();
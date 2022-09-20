/**
 * 弹窗
 * https://www.jq22.com/yanshi22096
 * @authors liningning 原作
 * @authors shijianhang 改进
 */
function Eject(){
	var _this = this;
	// 全屏遮罩背景
	var qback = $('<div class="qback"></div>').on('click',function(e){
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
		qback.remove();
	}
	/* 
	alert提示窗
	this.alert({
      title:'alert提示文案',
	  message:'这是alert弹窗，感觉还是很不错的'
	})
	*/
	_this.alert = function(obj){
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
	this.confirm({
      title:'confirm弹窗文案',
      message:'这是confirm弹窗,你确定删除吗?',
      confirm:function(){
            alert('您点击了确定')
      },
      cancel:function(){
            alert('您点击了取消')
      }
	})
	*/
	_this.confirm = function(obj){
		var confirmBox = $('<div class="alertBox"></div>')
		var confirmHead = $('<div class="alertHead">'+obj.title+'</div>')
		var confirmMes = $('<div class="alertMes">'+obj.message+'</div>')
		var confirmBtn = $('<span class="conBtn">确定</span>').on('click',function(e){
			_this.hide();
			setTimeout(function(){
				obj.confirm()
			},100)
		})
		var confirmcancel = $('<span class="cancel">取消</span>').on('click',function(e){
			_this.hide();
			setTimeout(function(){
				obj.cancel()
			},100)
		})
		confirmBox.append(confirmHead);
		confirmBox.append(confirmMes);
		confirmBox.append(confirmBtn);
		confirmBox.append(confirmcancel);
		_this.show(confirmBox);
	},
	// toast提示
	_this.toast = function(mes,time){
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
}

// 实例化
var modal = new Eject();
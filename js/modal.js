function modal_confirm(option){
    var {title,question,content,confirm,cancel,style,btn} = option;
    var yes_confirm,no_cancel;
    btn.forEach(item=>{
        if(item.yes){
            yes_confirm = item.yes;
        }
        else if(item.cancel){
            no_cancel = item.cancel;
        }
    }
    )
    if($('.modal_info')){
        $('.modal_info').remove();
    }
    $('body').append(`<div  class="modal_info" style="${style?style:''}"></div>`);
    var modal = $('.modal_info');
    modal.append(`<div class="head_blue"><h1>${title?title:'title'}</h1></div>`);
    modal.append(`<div class="body_main"><h1>${question?question:'question'}</h1><p>${content?content:'content'}</p></div>`);
    modal.append(`<div class="bottom_button"><div class="yes">${confirm?confirm:'confirm'}</div><div class="no">${cancel?cancel:'cancel'}</div></div>`);
    setTimeout(() => {
        $('.modal_info').addClass('md-show');
    }, 10);
    $('.yes,.no').on('click',function(){
        if($(this).attr('class')==='yes')
        {
            yes_confirm();
        }
        else{
            no_cancel();
        }
        $('.modal_info').removeClass('md-show');
        setTimeout(()=>{
            this.parentNode.parentNode.remove();
        },300);
    })
}
modal_confirm({
    title:'标题',
    question:'',
    content:'content',
    confirm:'',
    cancel:'cancel',
    style: 'width:200px;height:200px',
    btn:[{
        yes:function(){
            console.log('这个是confirm');
            }
        },
        {
        cancel:function(){
            console.log('这个是cancel');
            }
        }

    ]
});

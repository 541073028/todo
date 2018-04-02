var mySwiper = new Swiper ('.swiper-container', {
    // direction: 'vertical',// 垂直方向
    direction: 'horizontal',// 水平方向
    loop: true,

    // 如果需要分页器
    pagination: {
        el: '.swiper-pagination',
        dynamicBullets: true
    },
    initialSlide:3,
    speed:500,
    loop:true

});

//滚动条
var iscroll=new IScroll(".content",{//content，一定是固定大小的容器，有overflow:hidden的属性
    mouseWheel: true,//滚轮滚动
    scrollbars: true,
    shrinkScrollbars:'scale',
    click:true
});
//shrinkScrollbars:滚动超出滚动边界时，是否收缩滚动条。
// ‘clip’：裁剪超出的滚动条
// ‘scale’:按比例的收缩滚动条（占用CPU资源）
//  false:不收缩，

// var hammerobj=new Hammer("");



//点击新增

var state="project";
$(".add").click(function () {//回调函数
   $(".mask").show();
   $(".inputarea").transition({y:0},500);
   $(".submit").show();
   $(".update").hide();
});
$(".cancel").click(function () {

    $(".inputarea").transition({y:"-62vh"},500,function () {
        $(".mask").hide();
        // $(".mask").hide(function () {
        //     $(".inputarea").transition({y:"-62vh"},10)
        // });
    })
});
$(".submit").click(function () {
   var val=$("#text").val();//val("");表示获取值
    if (val===""){
        return;
    }
   $("#text").val("");//val("");表示设置值
    var data=getData();
    var time=new Date().getTime();
    data.push({content:val,time,star:false,done:false});
    saveData(data);
    $(".inputarea").transition({y:"-62vh"},500,function () {
        $(".mask").hide();

    });
    render();
});
$(".project").click(function () {
    $(this).addClass("active").siblings().removeClass("active");
    state="project";
    render();
});
$(".done").click(function () {
    $(this).addClass("active").siblings().removeClass("active");
    state="done";
    render();
});
$(".update").click(function () {
    var val=$("#text").val();
    if(val=""){
        return;
    }
    $("#text").val("");
    var data=getData();
    var index=$(this).data("index");
    data[index].content=val;
    saveData(data);
    render();
    $(".inputarea").transition({y:"-62vh"},500,function () {
        $(".mask").hide();
    })
});

function getData() {
    return localStorage.todo?JSON.parse(localStorage.todo):[];
}
function saveData(data) {
    localStorage.todo=JSON.stringify(data);
}
function render() {
    var data=getData();
    var str="";//考虑到用户手机设备可能版本较低，所以用var声明，解决兼容性问题
    data.forEach(function (val,index) {
        if(state==="project"&&val.done===false){
        str+="<li id="+index+"><p>"+val.content+"</p><time>"+parseTime(val.time)+"</time><span class='+(val.star?\"active\":\"\")+'>☆</span><div class='changestate'>完成</div></li>";//模板字符串中不能换行
    } else if(state==="done"&&val.done===true){
            str+="<li id="+index+"><p>"+val.content+"</p><time>"+parseTime(val.time)+"</time><span class='+(val.star?\"active\":\"\")+'>☆</span><div class='del'>删除</div></li>";
        }
    });
    $(".itemlist").html(str);
    iscroll.refresh();//refresh();刷新IScroll，使其在刚打开页面时就有滚动条
    addTouchEvent();
}
render();

//委派事件
$(".itemlist")
    .on("click",".changestate",function () {
    var index=$(this).parent().attr("id");
    var data=getData();
    data[index].done=true;
    saveData(data);
    render();
})
    .on("click",".del",function () {
    var index=$(this).parent().attr();
    var data=getData();
    data.splice(index,1);
    saveData(data);
    render();
})
    .on("click","span",function () {
        var index=$(this).parent().attr("id");
        var data=getData();
        data[index].star=!data[index].star;
        saveData(data);
        render();
    })
    .on("click","p",function () {
    var index=$(this).parent().attr("id");
    var data=getData();
    $(".mask").show();
    $(".inputarea").transition({y:0},500);
    $("#text").val(data[index].content);
    $(".submit").hide();
    $(".update").show().data("index",index);
});
function parseTime(time) {
    var date=new Date();
    date.setTime(time);
    var year=date.getFullYear();
    var month=setZero(date.getMonth()+1);
    var day=setZero(date.getDate());
    var hour=setZero(date.getHours());
    var min=setZero(date.getMinutes());
    var sec=setZero(date.getSeconds());
    return year+"/"+month+"/"+day+"<br>"+hour+":"+min+":"+sec;
}
function setZero(n) {
    return n<10?"0"+n:n;
}
function addTouchEvent() {
    $(".itemlist>li").each(function(index,ele){
        var hammerobj=new Hammer(ele);
        var max=window.innerWidth/5;
        var movex,sx;
        var state="start";
        var flag=true;
        hammerobj.on("panstart",function (e) {
            ele.style.transition="";
            sx=e.center.x;
        });
        hammerobj.on("panmove",function (e) {
            var cx=e.center.x;
            movex=cx-sx;
            if(movex>0&&state==="start"){
                flag=false;
                return;
            }
            if(movex<0&&state==="end"){
                flag=false;
                return;
            }
            if(Math.abs(movex)>max){
                flag=false;
                state==="start"?"end":"start";
                if(state==="end"){
                    $(ele).css("x",-max);
                }else {
                    $(ele).css("x",0);
                }
                return;
            }
            if(state==="end"){
                movex=cx-sx-max;
            }
            flag=true;
            $(ele).css("x",movex);
        });
        hammerobj.on("panend",function () {
            if(!flag)return;//if条件，若只有一行代码，后面的{}可省略不写
            if(Math.abs(movex)<max/2){
                $(ele).transition({x:0});
                state="start";
            }else {
                $(ele).transition({x:-max});
                state="end";
            }
        })
    })
}

render();


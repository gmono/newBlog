//接口导入 
import { IContentMeta } from '../../../app/Interface/IContentMeta';

import * as React from "react"
import * as ReactDOM from "react-dom"
import { IFiles } from '../../../app/Interface/IFiles';

// var React:any;
// var ReactDOM:any;

//时间格式化
function formatDate(fmt:string,date:Date)   
{ //author: meizz   
  var o = {   
    "M+" : date.getMonth()+1,                 //月份   
    "d+" : date.getDate(),                    //日   
    "h+" : date.getHours(),                   //小时   
    "m+" : date.getMinutes(),                 //分   
    "s+" : date.getSeconds(),                 //秒   
    "q+" : Math.floor((date.getMonth()+3)/3), //季度   
    "S"  : date.getMilliseconds()             //毫秒   
  };   
  if(/(y+)/.test(fmt))   
    fmt=fmt.replace(RegExp.$1, (date.getFullYear()+"").substr(4 - RegExp.$1.length));   
  for(var k in o)   
    if(new RegExp("("+ k +")").test(fmt))   
  fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));   
  return fmt;   
}

interface ItemInfo{
    info:IContentMeta;
    summary:string;
    OnTitleClick:(()=>void);
    OnSummaryClick:(()=>void);
    isExpanded:boolean
}
class Item extends React.Component<ItemInfo,{
    contentHeight:number
}>
{
    constructor(props:ItemInfo){
        super(props);
        this.state={
            contentHeight:0
        };
    }
    componentDidMount(){
        console.log((ReactDOM.findDOMNode(this.refs.content) as HTMLElement).clientHeight)
        this.setState({
            contentHeight:(ReactDOM.findDOMNode(this.refs.content) as HTMLElement).clientHeight
        })
    }
    componentDidUpdate(prevprop,prevstate){
        //当属性或状态变化时重新获取content的高度
        let h=(ReactDOM.findDOMNode(this.refs.content) as HTMLElement).clientHeight;
        if(this.state.contentHeight!=h)
            this.setState({
                contentHeight:h
            })
    }
    render()
    {
        let uexpstyle={
            height:"100px",
            overflow:"hidden",
            transition:"all ease-out 1s"
        };
        //展开状态下的高度 
        let expstyle={
            overflow:"hidden",
            transition:"all ease-in 1s",
            height:`${this.state.contentHeight}px`};
        
        let date=this.props.info.date? new Date(this.props.info.date):new Date();
        return (<div style={{
            whiteSpace:"normal"
        }}  className="item">
            {/*这是标题*/}
            <div style={{
                fontFamily:"微软雅黑",
                fontSize:"xx-large",
                cursor:"pointer"
            }} onClick={this.props.OnTitleClick}>{this.props.info.title}</div>
            <hr></hr>
            <div style={{
                color:"blue",
                fontSize:"0.7em"
            }}>{formatDate("yyyy-MM-dd hh:mm:ss",date)}</div>
    
            <div style={this.props.isExpanded? expstyle:uexpstyle} onClick={this.props.OnSummaryClick}>
                <div ref="content"  dangerouslySetInnerHTML={{__html:this.props.summary}}></div>
            {/* <span style={{
                color:"pink",
                fontSize:"0.8em",
                fontWeight:"bold"
            }} onClick={props.OnSummaryClick}>{props.isExpanded? "收起":"展开"}</span> */}
            </div>
        </div>)
    }
}


interface ArticleInfo
{
    metapath:string;
    //进入事件 提供元数据 内容 元数据地址 内容地址
    OnEnter:(metainfo:IContentMeta,html:string,metapath:string,contentpath:string)=>void;
}
interface ArticleItemState{
    isExpanded:boolean,
    isloaded:boolean,
    info:IContentMeta,
    html:string
}
class ArticleItem extends React.Component<ArticleInfo,ArticleItemState>{
    constructor(props:ArticleInfo){
        super(props);
        this.state={
            isExpanded:false,
            isloaded:false,
            info:null,
            html:null
        };
    }

    async loadArticle()
    {
        let res=await fetch(this.props.metapath);
        let json=await res.json() as IContentMeta;
        let hpath=this.props.metapath.replace(/.json$/,".html");
        let html=await (await fetch(hpath)).text()
        this.setState({
            info:json,
            html:html,
            isloaded:true
        });
    }
    async componentDidMount(){
        await this.loadArticle();
    }
    async componentDidUpdate(prevProps: Readonly<ArticleInfo>, prevState: Readonly<ArticleItemState>){
        if(prevProps.metapath!=this.props.metapath){
            await this.loadArticle();
        }
    }
    //对外公开的方法
    public summarySwitch(){
        this.setState({
            isExpanded:!(this.state.isExpanded)
        });
    }
    enterArticle(){
        //进入此篇文章
        //内容地址
        let hpath=this.props.metapath.replace(/.json$/,".html");
        this.props.OnEnter(this.state.info,this.state.html,this.props.metapath,hpath);
    }
    render(){
        if(!(this.state.isloaded)){
            return (<Item info={{
                title:"加载中",
                article_length:0,
                content_length:0,
                date:new Date(),
                article_path:"未知",
                from_dir:[],
                modify_time:new Date()
            }} 
            summary="加载中......" 
            OnTitleClick={()=>{}} 
            OnSummaryClick={()=>{}}
            isExpanded={this.state.isExpanded} />)
        } 
        else{
            return (
            <Item info={this.state.info} summary={this.state.html}
            OnTitleClick={this.enterArticle.bind(this)} 
            OnSummaryClick={()=>{}}
            isExpanded={this.state.isExpanded}
            />)
        }
    }
}



class ArticleList extends React.Component<{metalist:string[]}>
{
    constructor(props){
        super(props);
        

    }

    render()
    {
        return (
            <div style={{
                whiteSpace:"nowrap"
            }}>
                {this.props.metalist.map((v)=>{
                    return <div key={v} style={{
                        display:"inline-block",
                        width:"80vw",
                        verticalAlign:"top"
                    }}>
                        <ArticleItem   metapath={v} OnEnter={(...args)=>{
                        alert(JSON.stringify(args));
                        }}/>
                    </div>
                })}
            </div>
        )
    }
}




/**
 * 等宽容器，其会将自己的height设置为与scrollWidth相同 进而使其内容物都可以有同样的宽度
 */
class ScrollWidthContainer extends React.Component<{style?:React.CSSProperties,children:any[]}>{

    constructor(props){
        super(props);
    }
    reset()
    {
        let ele=ReactDOM.findDOMNode(this.refs.top);
        if(ele instanceof HTMLElement){
            ele.style.width=`${ele.scrollWidth}px`;
        }
        //暂时轮询解决
        setTimeout(this.reset.bind(this),500);
    }
    componentDidMount(){
        this.reset();
        
    }
    componentDidUpdate(prevprop,prevstate){
        // this.reset();
    }
    render(){
        return (<div ref="top" style={this.props.style? this.props.style:{}}>
            {this.props.children}
        </div>)
    }
}

type SummaryItemProps={title:string,summary:string,onClick:()=>any};
class SummaryItem extends React.PureComponent<SummaryItemProps,{mouseHover:boolean}>{
    constructor(props:SummaryItemProps){
        super(props);
        this.state={mouseHover:false}
    }
    

    render(){
        //生成css
        let css={
            padding:"8px",
            cursor:"pointer",
            boxShadow:"0 0 1px 0 gray",
            marginTop:"8px",
            fontFamily:"微软雅黑"
        } as React.CSSProperties;
        if(this.state.mouseHover){
            css.boxShadow="0 0 5px 0 gray"
        }
        return (<div style={css} onClick={this.props.onClick} 
        onMouseEnter={()=>this.setState({mouseHover:true})}
        onMouseLeave={()=>this.setState({mouseHover:false})}>
            <div id="title" style={{
                fontSize:"1.1rem",
                fontWeight:"bold",
                marginBottom:"0.2rem",
            }}>{this.props.title}</div>
            <div id="summary" style={{
                fontSize:"0.8em",
                fontStyle:"italic",
                color:"gray"
            }}>{this.props.summary}</div>
        </div>)
    }
}

//summary列表部分
type SummaryListProps={filesInfo:IFiles,onClick:(key:string)=>any}
class SummaryList extends React.PureComponent<SummaryListProps>{
    constructor(props:SummaryListProps){
        super(props);
    }
    getList(){
        let itemlsit:React.ReactNode[]=[];
        let lst=this.props.filesInfo.fileList;
        for(let key in lst){
            let item=lst[key];
            itemlsit.push(<SummaryItem key={item.article_path} title={item.title} summary="" onClick={()=>{
                //对外弹出事件
                this.props.onClick(key);
            }}></SummaryItem>)
        }
        return itemlsit;
    }
    render(){
        return (<div style={{
            padding:"12px",
            boxShadow:"0 0 5px 1px #0000003b",
            background:"rgba(255, 255, 255, 0.781)",

        }}>
            {this.getList()}
        </div>)
    }
}

//主容器部分
type MainContainerStates={
    data:IFiles;
    nowArticleMetaPath:string;
    metalist:string[];
}
type MainContainerProps={
    catalogPath:string;
}
class MainContainer extends React.Component<MainContainerProps,MainContainerStates>{
    constructor(props:MainContainerProps){
        super(props);
        //初始信息为空
        this.state={
            data:{
                useConfig:"",
                fileList:{}
            },
            metalist:[],
            nowArticleMetaPath:null
        }
    }

    async getCatalog()
    {
        let r=await fetch(this.props.catalogPath);
        let f=await r.json() as IFiles;
        
        let lst=this.getMetaList();
        //设置内部数据
        this.setState({
            data:f,
            metalist:lst,
            nowArticleMetaPath:lst[0]
        });
        //这里考虑加上加载完毕事件
        //整体考虑使用mobx管理
    }
    getMetaList(){
        //从中提取出文件列表和文章元数据url列表
        let s=this.state.data.fileList;
        let ss:string[]=[]
        for(let k in s){
            ss.push(k)
        }
        return ss;
    }
    componentDidMount(){
        this.getCatalog();
        //这里直接设置为恒展开
        let item=this.refs.item as ArticleItem;
        item.summarySwitch();
    }
    componentDidUpdate(prevprop,prevstate){
        if(prevprop.catalogPath!=this.props.catalogPath){
            this.getCatalog();
        }
    }
    listClick(key:string){
        this.setState({
            nowArticleMetaPath:key
        });
        //自动跳转到content开头
        let item=ReactDOM.findDOMNode(this.refs.item);
        if(item instanceof Element){
            item.scrollIntoView();
        }

    }
    enter(){
        //这里调用其函数展开item
        // let item=this.refs.item as ArticleItem;
        // item.summarySwitch();
    }
    render(){
        //侧边栏加内容区
        //左边为summarylist
        //content内容待定
        //暂时全部用自动适配子元素宽度的容器代替div
        return (<ScrollWidthContainer style={{
            display:"flex",
        }}>
            <div ref="left" style={{
                flex:"1"
            }}>
                <SummaryList  filesInfo={this.state.data} onClick={this.listClick.bind(this)} />
            </div>
            <div ref="content" style={{
                flex:"5",
                overflow:"scroll"
            }}>
                <ArticleItem ref="item" metapath={this.state.nowArticleMetaPath} OnEnter={this.enter.bind(this)} />>
            </div>
        </ScrollWidthContainer>)
    }
}
//暂时不适用上面的容器 性能问题 直接设置fixed
let Page=(<ScrollWidthContainer style={{
    backgroundImage:"url(./back.jpg)",
    backgroundPosition:"center",
    backgroundSize:"cover",
    backgroundAttachment:"fixed",
    backgroundBlendMode:"color-burn",
    backgroundOrigin:"border-box",
    backgroundRepeat:"no-repeat",
    minHeight:"100vh"
}}>
    <div style={{
        margin:"0",
        marginBottom:"1rem",
        padding:"2rem",
        // position:"sticky",
        // display:"inline-block",
        // left:"0",
        // top:"0"
    }}>
        <h1>我的博客</h1>
        <h3>点击标题展开</h3>
        </div>
    
    <hr style={{marginBottom:"30px"}}></hr>
    <MainContainer catalogPath="../content/files.json">
    </MainContainer>
    </ScrollWidthContainer>);

ReactDOM.render(Page,document.querySelector("#page"));

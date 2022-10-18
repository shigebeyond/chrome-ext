/* global chrome */

import React, { useState, useEffect, useRef } from 'react';
import { classNames } from 'primereact/utils';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Toast } from 'primereact/toast';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { Tooltip } from 'primereact/tooltip';
import { InputText } from 'primereact/inputtext';
import { Checkbox } from 'primereact/checkbox';
import { Divider } from 'primereact/divider';
import { Dropdown } from 'primereact/dropdown';
import { MultiSelect } from 'primereact/multiselect';
import { FilterMatchMode, FilterOperator } from 'primereact/api';
import _ from 'lodash';
import FileSaver from 'file-saver'
import HttpSerializer from '../lib/HttpSerializer';
import { copyTxt } from '../fg/copy';
import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';
import './component.css';

function HttpExporter() {
    let emptyReq = {
        id: 0,
        method: '',
        url: '',
        status: '',
        type: 'document',
        headers: [],
        queryString: [],
        cookies: [],
        postData: {
            params: []
        }
    };

    const [reqs, setReqs] = useState([]);
    const [req, setReq] = useState(emptyReq);
    const [reqDialog, setReqDialog] = useState(false);
    const [selectedReqs, setSelectedReqs] = useState(null);
    const [onlyCurrSite, setOnlyCurrSite] = useState(null);
    const [wd, setWd] = useState('');// 搜索词
    const toast = useRef(null);
    const dt = useRef(null);
    let id = 1

    const [filters, setFilters] = useState({
        'global': { value: null, matchMode: FilterMatchMode.CONTAINS },
        'method': { value: null, matchMode: FilterMatchMode.EQUALS },
        'url': { value: null, matchMode: FilterMatchMode.CONTAINS },
        'type': { value: null, matchMode: FilterMatchMode.IN }, // 与 MultiSelect 多值配合使用
        'status': { value: null, matchMode: FilterMatchMode.CONTAINS }
    });

    useEffect(() => {
        if(typeof(chrome.devtools) != "undefined"){ // 正式
            // 监听http请求
            chrome.devtools.network.onRequestFinished.addListener(data => {
                //debugger; // 无法调试，index.html 跟 main.js 源码加载不出来
                // showToast(JSON.stringify(data))
                // console.log("监听到http请求:")
                // console.log(data)

                // 拼接请求对象
                let {request, response, _resourceType} = data;
                request.status = response.status
                request.id = createId()
                request.type = _resourceType
                //console.log(request.url)

                // 记录请求
                addReq(request)
            });
        }else{ // 测试
            showToast('测试模式: 每隔2s添加一行')
            const timer = setInterval(() => {
                let id = createId()
                let method = id % 2 == 0 ? 'get' : 'post'
                let req = {
                    id,
                    method,
                    url: 'https://www.baidu.com/s?ie=UTF-8&wd=' + id,
                    status: 200,
                    type: 'document',
                    headers: [],
                    queryString: [],
                    cookies: [],
                    postData: {
                        params: []
                    }
                }
                addReq(req)
            }, 2000)
            return () => {
              clearInterval(timer)
            }
        }
    }, []);

    /**
     * 设置单个字段的过滤值
     */
    const setFieldFilter = (field, value) => {
        let _filters = { ...filters };
        _filters[field].value = value;

        setFilters(_filters);
    }

    /**
     * 设置全局的搜索
     */
    const setGlobalFilter = (value) => {
        setFieldFilter('global', value)
        setWd(value)
    }

    /**
     * 过滤本站点
     */
    const onOnlyCurrSiteChange = (e) => {
        let f = e.checked
        if(!f){ // 1 不过滤
            setGlobalFilter('')
            setOnlyCurrSite(f)
            return
        }

        // 2 过滤
        // 获得当前url
        let url = window.location.href // wrong: 是扩展地址 chrome-extension://bhafkkdcfmkknpagomfaidakoplodpae/index.html#/httpExporter
        chrome.devtools.inspectedWindow.eval(
            "window.location.href",
             (url, isException) => {
                let domain = getDomain(url, true)
                //console.log(domain)
                setGlobalFilter(domain)
                setOnlyCurrSite(f)
             }
        )
    }

    //　新加请求
    const addReq = (request) => {
        //setReqs(_reqs) // wrong: 直接改状态值 -- 获得不了最新的状态值，每次获得状态值都是[]，导致改写后数据错误，只显示最新一条记录，没有其他记录
        setReqs(reqs => {
            const _reqs = [...reqs] // 记录历史的请求
            _reqs.push(request)
            return _reqs
        })
    }

    const createId = () => {
        /*let id = '';
        let chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        for (let i = 0; i < 5; i++) {
            id += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return id;*/
        return id++;
    }


    const showToast = (msg) => {
        toast.current.show({severity: 'success', summary: 'Successful', detail: msg, life: 3000});
    }

    /**
     * 导出
     */
    const exportCSV = () => {
        dt.current.exportCSV();
    }

    /**
     * 打开选中的标签页
     */
    const openSelected = () => {
        let urls = selectedReqs.map((req) => {
            return req.url;
        })
        // 新建视窗
        chrome.windows.create({
            url: urls
        }, function (win) {
            console.log('新建视窗: ' + JSON.stringify(win))
        })
    }

    // 域名的正则
    const domainReg = /https?:\/\/([^/]+)/i;

    /**
     * 获得域名
     * @param url
     * @returns string
     */
    const getDomain = (url, withProtocol = false) => {
        let domain = url.match(domainReg);
        if(domain){
            if(withProtocol) // 带协议
                return domain[0]

            return domain[1]
        }
        return null
    }

    /**
     * 获得uri(去掉域名部分)
     * @param url
     * @returns string
     */
    const getUri = (url) => {
        return url.replace(domainReg, '');
    }

    /**
     * 删除单个请求
     */
    const deleteReq = (req) => {
        let _reqs = reqs.filter(val => val.id !== req.id);
        setReqs(_reqs);
    }

    /**
     * 删除选中的多个标签页
     */
    const deleteSelectedReqs = () => {
        let _reqs = reqs.filter(val => !selectedReqs.includes(val));
        setReqs(_reqs);
        setSelectedReqs(null);
    }

    /**
     * 显示单个请求的弹窗
     * @param req
     */
    const showReq = (req) => {
        setReq({...req});
        setReqDialog(true);
    }

    const hideDialog = () => {
        setReqDialog(false);
    }

    const copy = (txt, label) => {
        copyTxt(txt)
        showToast('复制' + label + '成功')
    }

    /**
     * 复制curl
     */
    const copyCurl = (req) => {
        let s = new HttpSerializer(req)
        let r = s.toCurl()
        copy(r, 'Curl');
    }

    /**
     * 复制HttpRunner
     */
    const copyHttpRunner = (req) => {
        let s = new HttpSerializer(req)
        let r = s.toHttpRunnerYaml()
        copy(r, 'HttpRunner');
    }

    /**
     * 复制HttpBoot
     */
    const copyHttpBoot = (req) => {
        let s = new HttpSerializer(req)
        let r = s.toHttpBootYaml()
        copy(r, 'HttpBoot');
    }

    /**
     * 导出curl
     */
    const exportCurl = (reqs) => {
        let r = '';
        for(let req of reqs){
            let s = new HttpSerializer(req)
            r += s.toCurl() + " ;\n\n"
        }
        exportFile(r, 'curl.txt');
    }

    /**
     * 导出HttpRunner
     */
    const exportHttpRunner = (reqs) => {
        let r = '';
        for(let req of reqs){
            let s = new HttpSerializer(req)
            r += s.toHttpRunnerYaml() + "\n"
        }
        exportFile(r, 'HttpRunner.yml');
    }

    /**
     * 导出HttpBoot
     */
    const exportHttpBoot = (reqs) => {
        let r = '';
        for(let req of reqs){
            let s = new HttpSerializer(req)
            r += s.toHttpBootYaml() + "\n"
        }
        exportFile(r, 'HttpBoot.yml');
    }

    // 导出(保存)文件
    const exportFile = (txt, file) => {
        file = file.replace('.', '-'+ (new Date().getTime()) + '.') // 文件名添加时间戳
        //console.log(txt)
        let blob = new Blob([txt], {type: 'text/plain'});
        FileSaver.saveAs(blob, file);
    } 

    /**
     * 渲染请求的某个字段
     */
    const renderField = (req, field) => {
        let r = ''
        // 获得字段值
        // let vs = req[field] || []
        // 获得多级字段值
        let vs = _.result(req, field) || []
        for(let v of vs){
            let de = v.value
            if(field == 'queryString' ||  field == 'postData.params')
                de = decodeURIComponent(v.value)
            r += `<strong>${v.name}</strong>: ${de}<br/>`;
        }
        return (
            <div className="field">
                <h3>{field}</h3>
                <div dangerouslySetInnerHTML={{ __html: r }} />
            </div>
        )
    }

    /**
     * url列渲染
     * @param row
     * @returns {JSX.Element}
     */
    const renderUrl = (row) => {
        let url = row.url
        // 获得uri
        let uri = getUri(url)
        if(uri == ''){ // 空则取域名
            uri = getDomain(url)
        }else{ //截取指定长度, 并加上省略号
            let len = 50
            uri = uri.length > len ? uri.slice(0, len) + "..." : uri;
        }
        return <a href={url} target="_blank" rel="noreferrer" className="w-7rem shadow-2 tip-target" data-pr-tooltip={url}>{uri}</a>
    }

    const methods = ['get', 'post'];

    const renderMethodFilter = (options) => {
        return <Dropdown value={options.value} options={methods} onChange={(e) => options.filterApplyCallback(e.value)} placeholder="搜索" className="p-column-filter" showClear />;
    }

    const types = ['script', 'document', 'image', 'stylesheet', 'xhr', 'other']

    const renderTypeFilter = (options) => {
        return <MultiSelect value={options.value} options={types} onChange={(e) => setTypeFilter(e.value) } placeholder="搜索" className="p-column-filter" maxSelectedLabels={1} />;
        // return <Dropdown value={options.value} options={types} onChange={(e) => options.filterApplyCallback(e.value)} placeholder="搜索" className="p-column-filter" showClear />;
    }

    /**
     * 设置type过滤器
     */
    const setTypeFilter = (value) => {
        // wrong：过滤不了
        // value 是勾选的多个值
        //options.filterCallback(value);
        setFieldFilter('type', value)
    }

    /**
     * 操作按钮列渲染
     * @param row
     * @returns {JSX.Element}
     */
    const renderActions = (row) => {
        return (
            <React.Fragment>
                <Button icon="pi pi-trash" className="p-button-danger" onClick={() => deleteReq(row)} />
                <Button label="打印" className="" onClick={() => console.log(row)} />
                <Button label="详情" className="p-button-secondary" onClick={() => showReq(row)} />
                <Button label="复制Curl" className="p-button-success" onClick={() => copyCurl(row)} tooltip="复制Curl命令" tooltipOptions={{position: 'bottom'}} />
                <Button label="复制HttpRunner" className="p-button-info" onClick={() => copyHttpRunner(row)} tooltip="复制HttpRunner yaml脚本" tooltipOptions={{position: 'bottom'}} />
                <Button label="复制HttpBoot" className="p-button-warning" onClick={() => copyHttpBoot(row)} tooltip="复制HttpBoot yaml脚本" tooltipOptions={{position: 'bottom'}} />
            </React.Fragment>
        );
    }

    // 表头
    const header = (
        <div className="flex flex-column md:flex-row md:align-items-center justify-content-between">
            <span className="p-input-icon-left w-full md:w-auto">
                <i className="pi pi-search" />
                <InputText value={wd} type="search" onInput={(e) => setGlobalFilter(e.target.value)} placeholder="Search..." className="w-full lg:w-auto" />
                 {" "}
                <label htmlFor="cb" className="p-checkbox-label">仅本站点</label>
                <Checkbox inputId="cb" onChange={onOnlyCurrSiteChange} checked={onlyCurrSite}></Checkbox>
            </span>
            <div className="mt-3 md:mt-0 flex justify-content-end">
                <Button icon="pi pi-trash" className="p-button-danger" onClick={deleteSelectedReqs} disabled={!selectedReqs || !selectedReqs.length} tooltip="删除" tooltipOptions={{position: 'bottom'}} />
                <Button label="导出Curl" className="p-button-success" disabled={!selectedReqs || !selectedReqs.length} onClick={() => exportCurl(selectedReqs)} tooltip="导出Curl命令" tooltipOptions={{position: 'bottom'}} />
                <Button label="导出HttpRunner" className="p-button-info" disabled={!selectedReqs || !selectedReqs.length} onClick={() => exportHttpRunner(selectedReqs)} tooltip="导出HttpRunner yaml脚本" tooltipOptions={{position: 'bottom'}} />
                <Button label="导出HttpBoot" className="p-button-warning" disabled={!selectedReqs || !selectedReqs.length} onClick={() => exportHttpBoot(selectedReqs)} tooltip="导出HttpBoot yaml脚本" tooltipOptions={{position: 'bottom'}} />
            </div>
        </div>
    );


    // 编辑弹窗的页脚
    const reqDialogFooter = (
        <React.Fragment>
            <Button label="Close" icon="pi pi-times" className="p-button-text" onClick={hideDialog} />
        </React.Fragment>
    );

    const filterProps = (fw, w = null) => {
        let props = {
             filterMenuStyle:{width: fw+'rem'},
             filterPlaceholder:"搜索",
             showFilterMenu:false,
             filter: true,
        }
        if(w != null)
            props['style'] = {width: w+'rem'} 
        return props
    }


    // 表格
    return (
        <div className="datatable-crud-demo surface-card p-4 border-round shadow-2">
            <Toast ref={toast} />
            <ConfirmDialog />
            <Tooltip target=".tip-target" mouseTrack mouseTrackLeft={10} />

            <div className="text-3xl text-800 font-bold mb-4 tip-target" data-pr-tooltip='将http请求导出为Curl/HttpRunner/HttpBoot等脚本'>Http请求导出</div>
            <DataTable ref={dt} value={reqs} selection={selectedReqs} onSelectionChange={(e) => setSelectedReqs(e.value)}
                       dataKey="id" paginator rows={30} rowsPerPageOptions={[10, 20, 30, 50, 70, 100]}
                       paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                       currentPageReportTemplate="Showing {first} to {last} of {totalRecords} pages"
                       filters={filters} filterDisplay="row" globalFilterFields={['url']} header={header} responsiveLayout="scroll">
                <Column selectionMode="multiple" headerStyle={{width:'3rem'}} exportable={false}></Column>
                <Column field="method" header="method" {...filterProps(4, 4)} filterElement={renderMethodFilter}></Column>
                <Column field="url" header="url" body={renderUrl} {...filterProps(8)}></Column>
                <Column field="type" header="type" {...filterProps(4, 4)} filterElement={renderTypeFilter}></Column>
                <Column field="status" header="status" {...filterProps(8, 8)}></Column>
                <Column body={renderActions} exportable={false} style={{minWidth:'8rem'}}></Column>
            </DataTable>

            <Dialog visible={reqDialog} breakpoints={{'960px': '75vw', '640px': '100vw'}} style={{width: '50vw', 'font-size': '13px'}} header="Http请求详情" modal className="p-fluid" footer={reqDialogFooter} onHide={hideDialog}>
                <div className="field">
                    <h3>常规</h3>
                    <strong>method</strong>: {req.method}<br/>
                    <strong>url</strong>: {req.url}<br/>
                    <strong>type</strong>: {req.type}<br/>
                    <strong>status</strong>: {req.status}
                </div>
                <Divider type="dashed" />
                {renderField(req, 'headers')}
                <Divider type="dashed" />
                {renderField(req, 'cookies')}
                <Divider type="dashed" />
                {renderField(req, 'queryString')}
                <Divider type="dashed" />
                {renderField(req, 'postData.params')}
                
            </Dialog>
        </div>
    );
}

export default HttpExporter;
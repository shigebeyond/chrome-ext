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
import { Divider } from 'primereact/divider';
import { buildCurl } from '../lib/curl';
import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';

// 表格过滤 https://www.primefaces.org/primereact/datatable/filter/
// demo https://juejin.cn/post/6844903748142104589
function HttpExporter() {
    let emptyReq = {
        id: 0,
        method: '',
        url: '',
        status: '',
        headers: [],
        queryString: [],
        cookies: []
    };

    const [reqs, setReqs] = useState([]);
    const [req, setReq] = useState(emptyReq);
    const [reqDialog, setReqDialog] = useState(false);
    const [selectedReqs, setSelectedReqs] = useState(null);
    const [globalFilter, setGlobalFilter] = useState(null);
    const toast = useRef(null);
    const dt = useRef(null);

    useEffect(() => {
        if(typeof(chrome.devtools) != "undefined"){ // 正式
            // 监听http请求
            chrome.devtools.network.onRequestFinished.addListener(data => {
                //debugger; // 无法调试，index.html 跟 main.js 源码加载不出来
                // showToast(JSON.stringify(data))
                // console.log("监听到http请求:")
                // console.log(data)

                // 拼接请求对象
                let {request, response} = data;
                request.status = response.status
                request.id = createId()

                // 记录请求
                addReq(request)
            });
        }else{ // 测试
            showToast('测试模式: 每隔2s添加一行')
            const timer = setInterval(() => {
                let id = createId()
                let req = {
                    id,
                    method: 'get',
                    url: 'https://www.baidu.com/s?ie=UTF-8&wd=' + id,
                    status: 200,
                    headers: [],
                    queryString: [],
                    cookies: []
                }
                addReq(req)
            }, 2000)
            return () => {
              clearInterval(timer)
            }
        }
    }, []);

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
        let id = '';
        let chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        for (let i = 0; i < 5; i++) {
            id += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return id;
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
    const domainReg = /https?:\/\/([^/]+)\//i;

    /**
     * 获得域名
     * @param url
     * @returns string
     */
    const getDomain = (url) => {
        let domain = url.match(domainReg);
        return domain && domain[2];
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

    const copyCurl = (req) => {
        r = buildCurl()
        window.copy('hello');
    }

    const renderField = (req, field) => {
        let r = ''
        for(let v of req[field]){
            de = v.value
            if(field == 'queryString')
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
     * @param rowData
     * @returns {JSX.Element}
     */
    const renderUrl = (rowData) => {
        // 获得uri
        let uri = getUri(rowData.url)
        //截取指定长度, 并加上省略号
        uri = uri.length > 40 ? uri.slice(0, 40) + "..." : uri;
        return <a href={rowData.url} target="_blank" rel="noreferrer" className="w-7rem shadow-2 tip-target" data-pr-tooltip={rowData.url}>{uri}</a>
    }

    /**
     * 操作按钮列渲染
     * @param rowData
     * @returns {JSX.Element}
     */
    const renderActions = (rowData) => {
        return (
            <React.Fragment>
                <Button label="详情" onClick={() => showReq(rowData)} />
                <Button label="Curl" className="p-button-success" tooltip="复制Curl命令" () => copyCurl(rowData) />
                <Button label="HttpRunner" className="p-button-info" tooltip="复制HttpRunner命令" () => copyHttpRunner(rowData) />
                <Button label="HttpBoot" className="p-button-warning" tooltip="复制HttpBoot命令" () => copyHttpBoot(rowData) />
            </React.Fragment>
        );
    }

    // 表头
    const header = (
        <div className="flex flex-column md:flex-row md:align-items-center justify-content-between">
            <span className="p-input-icon-left w-full md:w-auto">
                <i className="pi pi-search" />
                <InputText type="search" onInput={(e) => setGlobalFilter(e.target.value)} placeholder="Search..." className="w-full lg:w-auto" />
            </span>
            <div className="mt-3 md:mt-0 flex justify-content-end">
                <Button icon="pi pi-trash" className="p-button-danger mr-2 p-button-rounded" onClick={test} disabled={!selectedReqs || !selectedReqs.length} tooltip="Delete" tooltipOptions={{position: 'bottom'}} />
                <Button icon="pi pi-external-link" className="p-button-warning p-button-rounded" onClick={openSelected} disabled={!selectedReqs || !selectedReqs.length} tooltip="Open" tooltipOptions={{position: 'bottom'}} />
                <Button icon="pi pi-upload" className="p-button-help p-button-rounded" onClick={exportCSV} tooltip="Export" tooltipOptions={{position: 'bottom'}} />
            </div>
        </div>
    );


    // 编辑弹窗的页脚
    const reqDialogFooter = (
        <React.Fragment>
            <Button label="Close" icon="pi pi-times" className="p-button-text" onClick={hideDialog} />
        </React.Fragment>
    );

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
                       globalFilter={globalFilter} globalFilterFields={['url']}header={header} responsiveLayout="scroll">
                <Column selectionMode="multiple" headerStyle={{ width: '3rem' }} exportable={false}></Column>
                <Column field="method" header="method" style={{ width: '4rem' }}></Column>
                <Column field="url" header="url" body={renderUrl}></Column>
                <Column field="status" header="status" style={{ width: '4rem' }}></Column>
                <Column body={renderActions} exportable={false} style={{ minWidth: '8rem' }}></Column>
            </DataTable>

            <Dialog visible={reqDialog} breakpoints={{'960px': '75vw', '640px': '100vw'}} style={{width: '50vw', 'font-size': '13px'}} header="Http请求详情" modal className="p-fluid" footer={reqDialogFooter} onHide={hideDialog}>
                <div className="field">
                    <h3>常规</h3>
                    <strong>method</strong>: {req.method}<br/>
                    <strong>url</strong>: {req.url}<br/>
                    <strong>status</strong>: {req.status}
                </div>
                <Divider type="dashed" />
                {renderField(req, 'headers')}
                <Divider type="dashed" />
                {renderField(req, 'queryString')}
                <Divider type="dashed" />
                {renderField(req, 'cookies')}
            </Dialog>
        </div>
    );
}

export default HttpExporter;
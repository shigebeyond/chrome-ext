/* global chrome */

import React, { useState, useEffect, useRef } from 'react';
import { classNames } from 'primereact/utils';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Toast } from 'primereact/toast';
import { Button } from 'primereact/button';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { InputText } from 'primereact/inputtext';
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
        status: ''
    };

    const [reqs, setReqs] = useState([]);
    const [req, setReq] = useState(emptyReq);
    const [selectedReqs, setSelectedReqs] = useState(null);
    const [globalFilter, setGlobalFilter] = useState(null);
    const toast = useRef(null);
    const dt = useRef(null);

    useEffect(() => {
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

    /**
     * 编辑弹窗中的某个字段的输入框的输入监听
     * @param e
     * @param name
     */
    const onInputChange = (e, name) => {
        const val = (e.target && e.target.value) || '';
        let _req = {...req};
        _req[`${name}`] = val;

        setReq(_req);
    }

    /**
     * 获得域名
     * @param url
     * @returns {*}
     */
    const getDomain = (url) => {
        let reg = /https?:\/\/([^/]+)\//i;
        let domain = url.match(reg);
        return domain && domain[2];
    }


    const test = (req) => {

    }

    /**
     * url列渲染
     * @param rowData
     * @returns {JSX.Element}
     */
    const urlBodyTemplate = (rowData) => {
        let domain = getDomain(rowData.url)
        return <a href={rowData.url} target="_blank" rel="noreferrer" className="w-7rem shadow-2">{rowData.url}</a>
    }

    /**
     * 操作按钮列渲染
     * @param rowData
     * @returns {JSX.Element}
     */
    const actionBodyTemplate = (rowData) => {
        return (
            <React.Fragment>
                <Button icon="pi pi-pencil" className="p-button-rounded p-button-success mr-2" onClick={() => test(rowData)} />
                <Button icon="pi pi-trash" className="p-button-rounded p-button-danger" onClick={() => test(rowData)} />
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

    // 表格
    return (
        <div className="datatable-crud-demo surface-card p-4 border-round shadow-2">
            <Toast ref={toast} />
            <ConfirmDialog />

            <div className="text-3xl text-800 font-bold mb-4">Http请求导出</div>
            <DataTable ref={dt} value={reqs} selection={selectedReqs} onSelectionChange={(e) => setSelectedReqs(e.value)}
                       dataKey="id" paginator rows={30} rowsPerPageOptions={[10, 20, 30, 50, 70, 100]}
                       paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                       currentPageReportTemplate="Showing {first} to {last} of {totalRecords} pages"
                       globalFilter={globalFilter} globalFilterFields={['url']}header={header} responsiveLayout="scroll">
                <Column selectionMode="multiple" headerStyle={{ width: '3rem' }} exportable={false}></Column>
                <Column field="method" header="method" style={{ minWidth: '16rem' }}></Column>
                <Column field="url" header="Url" body={urlBodyTemplate}></Column>
                <Column field="status" header="status" sortable style={{ width: '12rem' }}></Column>
                <Column body={actionBodyTemplate} exportable={false} style={{ minWidth: '8rem' }}></Column>
            </DataTable>
        </div>
    );
}

export default HttpExporter;
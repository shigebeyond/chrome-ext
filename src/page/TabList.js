/* global chrome */

import React, { useState, useEffect, useRef } from 'react';
import { classNames } from 'primereact/utils';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Toast } from 'primereact/toast';
import { Button } from 'primereact/button';
import { InputTextarea } from 'primereact/inputtextarea';
import { Dialog } from 'primereact/dialog';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { InputText } from 'primereact/inputtext';
import { parseDomain } from '../lib/util';
import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';
import store from '../lib/store'

// 存储的key
const storeKey = "backupTabs";

function TabList() {
    let emptyTab = {
        id: 0,
        name: '',
        url: '',
        date: ''
    };

    const [tabs, setTabs] = useState(null);
    const [tabDialog, setTabDialog] = useState(false);
    const [tab, setTab] = useState(emptyTab);
    const [selectedTabs, setSelectedTabs] = useState(null);
    const [submitted, setSubmitted] = useState(false);
    const [globalFilter, setGlobalFilter] = useState(null);
    const toast = useRef(null);
    const dt = useRef(null);

    useEffect(() => {
        let data = getTabs()
        setTabs(data)
    }, []);

    /**
     * 获得备份的标签页
     * @returns []
     */
    const getTabs = () => {
        return store.readStore(storeKey) || []
    }

    /**
     * 设置tabs状态+保存
     */
    const setAndStoreTabs = (tabs) => {
        setTabs(tabs)
        store.writeStore(storeKey, tabs)
    }

    /*const openNew = () => {
        setTab(emptyTab);
        setSubmitted(false);
        setTabDialog(true);
    }*/

    const hideDialog = () => {
        setSubmitted(false);
        setTabDialog(false);
    }

    const showToast = (msg) => {
        toast.current.show({severity: 'success', summary: 'Successful', detail: msg, life: 3000});
    }

    /**
     * 保存编辑的标签页
     */
    const saveTab = () => {
        setSubmitted(true);

        if (tab.name.trim()) {
            let _tabs = [...tabs];
            let _tab = {...tab};
            const index = findIndexById(tab.id);
            _tabs[index] = _tab;
            showToast('更新标签页');
            setAndStoreTabs(_tabs);
            setTabDialog(false);
            setTab(emptyTab);
        }
    }

    /**
     * 编辑的标签页
     * @param tab
     */
    const editTab = (tab) => {
        setTab({...tab});
        setTabDialog(true);
    }

    /**
     * 确认删除单个标签页
     * @param tab
     */
    const confirmDeleteTab = (tab) => {
        confirmDialog({
            message: `你要删除标签页[${tab.name}]吗?`,
            header: 'Confirmation',
            icon: 'pi pi-exclamation-triangle',
            accept: () => deleteTab(tab),
        });
    }

    /**
     * 删除单个标签页
     */
    const deleteTab = (tab) => {
        let _tabs = tabs.filter(val => val.id !== tab.id);
        setAndStoreTabs(_tabs);
        showToast('删除标签页')
    }

    const findIndexById = (id) => {
        let index = -1;
        for (let i = 0; i < tabs.length; i++) {
            if (tabs[i].id === id) {
                index = i;
                break;
            }
        }

        return index;
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
        let urls = selectedTabs.map((tab) => {
            return tab.url;
        })
        // 新建视窗
        chrome.windows.create({
            url: urls
        }, function (win) {
            console.log('新建视窗: ' + JSON.stringify(win))
            showToast('打开并删除选中的标签页')
            // 删除选中标签页
            deleteSelectedTabs()
        })
    }

    /**
     * 确认删除选中的多个标签页
     */
    const confirmDeleteSelected = () => {
        confirmDialog({
            message: `你要删除选中的标签页吗?`,
            header: 'Confirmation',
            icon: 'pi pi-exclamation-triangle',
            accept: deleteSelectedTabs,
        });
    }

    /**
     * 删除选中的多个标签页
     */
    const deleteSelectedTabs = () => {
        let _tabs = tabs.filter(val => !selectedTabs.includes(val));
        setAndStoreTabs(_tabs);
        setSelectedTabs(null);
        showToast('删除选中标签页')
    }

    /**
     * 编辑弹窗中的某个字段的输入框的输入监听
     * @param e
     * @param name
     */
    const onInputChange = (e, name) => {
        const val = (e.target && e.target.value) || '';
        let _tab = {...tab};
        _tab[`${name}`] = val;

        setTab(_tab);
    }

    /**
     * url列渲染
     * @param row
     * @returns {JSX.Element}
     */
    const renderUrl = (row) => {
        let domain = parseDomain(row.url)
        return <a href={row.url} target="_blank" rel="noreferrer" className="w-7rem shadow-2">{domain}</a>
    }

    /**
     * 操作按钮列渲染
     * @param row
     * @returns {JSX.Element}
     */
    const renderActions = (row) => {
        return (
            <React.Fragment>
                <Button icon="pi pi-pencil" className="p-button-rounded p-button-success mr-2" onClick={() => editTab(row)} />
                <Button icon="pi pi-trash" className="p-button-rounded p-button-danger" onClick={() => confirmDeleteTab(row)} />
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
                <Button icon="pi pi-trash" className="p-button-danger mr-2 p-button-rounded" onClick={confirmDeleteSelected} disabled={!selectedTabs || !selectedTabs.length} tooltip="Delete" tooltipOptions={{position: 'bottom'}} />
                <Button icon="pi pi-external-link" className="p-button-warning p-button-rounded" onClick={openSelected} disabled={!selectedTabs || !selectedTabs.length} tooltip="Open" tooltipOptions={{position: 'bottom'}} />
                <Button icon="pi pi-upload" className="p-button-help p-button-rounded" onClick={exportCSV} tooltip="Export" tooltipOptions={{position: 'bottom'}} />
            </div>
        </div>
    );

    // 编辑弹窗的页脚
    const tabDialogFooter = (
        <React.Fragment>
            <Button label="Cancel" icon="pi pi-times" className="p-button-text" onClick={hideDialog} />
            <Button label="Save" icon="pi pi-check" onClick={saveTab} />
        </React.Fragment>
    );

    // 表格
    return (
        <div className="datatable-crud-demo surface-card p-4 border-round shadow-2">
            <Toast ref={toast} />
            <ConfirmDialog />

            <div className="text-3xl text-800 font-bold mb-4">备份标签页管理</div>
            <DataTable ref={dt} value={tabs} selection={selectedTabs} onSelectionChange={(e) => setSelectedTabs(e.value)}
                       dataKey="id" paginator rows={30} rowsPerPageOptions={[10, 20, 30, 50, 70, 100]}
                       paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                       currentPageReportTemplate="Showing {first} to {last} of {totalRecords} pages"
                       globalFilter={globalFilter} header={header} responsiveLayout="scroll">
                <Column selectionMode="multiple" headerStyle={{ width: '3rem' }} exportable={false}></Column>
                <Column field="name" header="Name" style={{ minWidth: '16rem' }}></Column>
                <Column field="url" header="Url" body={renderUrl}></Column>
                <Column field="date" header="Date" sortable style={{ width: '12rem' }}></Column>
                <Column body={renderActions} exportable={false} style={{ minWidth: '8rem' }}></Column>
            </DataTable>

            <Dialog visible={tabDialog} breakpoints={{'960px': '75vw', '640px': '100vw'}} style={{width: '40vw'}} header="标签页详情" modal className="p-fluid" footer={tabDialogFooter} onHide={hideDialog}>
                <div className="field">
                    <label htmlFor="name">Name</label>
                    <InputText id="name" value={tab.name} onChange={(e) => onInputChange(e, 'name')} required autoFocus className={classNames({ 'p-invalid': submitted && !tab.name })} />
                    {submitted && !tab.name && <small className="p-error">Name is required.</small>}
                </div>
                <div className="field">
                    <label htmlFor="url">Url</label>
                    <InputTextarea id="url" value={tab.url} onChange={(e) => onInputChange(e, 'url')} required rows={3} cols={20} />
                </div>
            </Dialog>

        </div>
    );
}

export default TabList;
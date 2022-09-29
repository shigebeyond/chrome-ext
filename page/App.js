import React, { useState, useEffect, useRef } from 'react';
import { classNames } from 'primereact/utils';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Toast } from 'primereact/toast';
import { Button } from 'primereact/button';
import { InputTextarea } from 'primereact/inputtextarea';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';
import store from './store'

// 存储的key
const storeKey = "backupTabs";

function App() {
    let emptyTab = {
        id: null,
        name: '',
        url: '',
        date: '2022-09-28'
    };

    const [tabs, setTabs] = useState(null);
    const [tabDialog, setTabDialog] = useState(false);
    const [deleteTabDialog, setDeleteTabDialog] = useState(false);
    const [deleteTabsDialog, setDeleteTabsDialog] = useState(false);
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

    useEffect((param) => {
        debugger;
        console.log(param)
    }, [tabs]);

    const getTabs = () => {
        return store.readStore(storeKey) || []
    }

    const openNew = () => {
        setTab(emptyTab);
        setSubmitted(false);
        setTabDialog(true);
    }

    const hideDialog = () => {
        setSubmitted(false);
        setTabDialog(false);
    }

    const hideDeleteTabDialog = () => {
        setDeleteTabDialog(false);
    }

    const hideDeleteTabsDialog = () => {
        setDeleteTabsDialog(false);
    }

    const saveTab = () => {
        setSubmitted(true);

        if (tab.name.trim()) {
            let _tabs = [...tabs];
            let _tab = {...tab};
            const index = findIndexById(tab.id);
            _tabs[index] = _tab;
            store.writeStore(storeKey, _tabs)

            toast.current.show({ severity: 'success', summary: 'Successful', detail: 'Tab Updated', life: 3000 });
            setTabs(_tabs);
            setTabDialog(false);
            setTab(emptyTab);
        }
    }

    const editTab = (tab) => {
        setTab({...tab});
        setTabDialog(true);
    }

    const confirmDeleteTab = (tab) => {
        setTab(tab);
        setDeleteTabDialog(true);
    }

    const deleteTab = () => {
        let _tabs = tabs.filter(val => val.id !== tab.id);
        store.writeStore(storeKey, _tabs)

        setTabs(_tabs);
        setDeleteTabDialog(false);
        setTab(emptyTab);
        toast.current.show({ severity: 'success', summary: 'Successful', detail: 'Tab Deleted', life: 3000 });
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

    const exportCSV = () => {
        dt.current.exportCSV();
    }

    const confirmDeleteSelected = () => {
        setDeleteTabsDialog(true);
    }

    const deleteSelectedTabs = () => {
        let _tabs = tabs.filter(val => !selectedTabs.includes(val));
        setTabs(_tabs);
        setDeleteTabsDialog(false);
        setSelectedTabs(null);
        toast.current.show({ severity: 'success', summary: 'Successful', detail: 'Tabs Deleted', life: 3000 });
    }


    const onInputChange = (e, name) => {
        const val = (e.target && e.target.value) || '';
        let _tab = {...tab};
        _tab[`${name}`] = val;

        setTab(_tab);
    }

    const onInputNumberChange = (e, name) => {
        const val = e.value || 0;
        let _tab = {...tab};
        _tab[`${name}`] = val;

        setTab(_tab);
    }

    const getDomain = (url) => {
        let reg = /http(s):\/\/([^/]+)\//i;
        let domain = url.match(reg);
        return domain && domain[2];
    }

    const urlBodyTemplate = (rowData) => {
        let domain = getDomain(rowData.url)
        return <a href={rowData.url} target="_blank" className="w-7rem shadow-2">{domain}</a>
    }

    const actionBodyTemplate = (rowData) => {
        return (
            <React.Fragment>
                <Button icon="pi pi-pencil" className="p-button-rounded p-button-success mr-2" onClick={() => editTab(rowData)} />
                <Button icon="pi pi-trash" className="p-button-rounded p-button-danger" onClick={() => confirmDeleteTab(rowData)} />
            </React.Fragment>
        );
    }

    const header = (
        <div className="flex flex-column md:flex-row md:align-items-center justify-content-between">
            <span className="p-input-icon-left w-full md:w-auto">
                <i className="pi pi-search" />
                <InputText type="search" onInput={(e) => setGlobalFilter(e.target.value)} placeholder="Search..." className="w-full lg:w-auto" />
            </span>
            <div className="mt-3 md:mt-0 flex justify-content-end">
                <Button icon="pi pi-trash" className="p-button-danger mr-2 p-button-rounded" onClick={confirmDeleteSelected} disabled={!selectedTabs || !selectedTabs.length} tooltip="Delete" tooltipOptions={{position: 'bottom'}} />
                <Button icon="pi pi-upload" className="p-button-help p-button-rounded" onClick={exportCSV} tooltip="Export" tooltipOptions={{position: 'bottom'}} />
            </div>
        </div>
    );
    const tabDialogFooter = (
        <React.Fragment>
            <Button label="Cancel" icon="pi pi-times" className="p-button-text" onClick={hideDialog} />
            <Button label="Save" icon="pi pi-check" onClick={saveTab} />
        </React.Fragment>
    );

    const deleteTabDialogFooter = (
        <React.Fragment>
            <Button label="No" icon="pi pi-times" className="p-button-text" onClick={hideDeleteTabDialog} />
            <Button label="Yes" icon="pi pi-check" className="p-button-text" onClick={deleteTab} />
        </React.Fragment>
    );

    const deleteTabsDialogFooter = (
        <React.Fragment>
            <Button label="No" icon="pi pi-times" className="p-button-text" onClick={hideDeleteTabsDialog} />
            <Button label="Yes" icon="pi pi-check" className="p-button-text" onClick={deleteSelectedTabs} />
        </React.Fragment>
    );

    return (
        <div className="datatable-crud-demo surface-card p-4 border-round shadow-2">
            <Toast ref={toast} />

            <div className="text-3xl text-800 font-bold mb-4">备份标签页管理</div>
            <DataTable ref={dt} value={tabs} selection={selectedTabs} onSelectionChange={(e) => setSelectedTabs(e.value)}
                       dataKey="id" paginator rows={30} rowsPerPageOptions={[10, 20, 30, 40,  50]}
                       paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                       currentPageReportTemplate="Showing {first} to {last} of {totalRecords} pages"
                       globalFilter={globalFilter} header={header} responsiveLayout="scroll">
                <Column selectionMode="multiple" headerStyle={{ width: '3rem' }} exportable={false}></Column>
                <Column field="name" header="Name" style={{ minWidth: '16rem' }}></Column>
                <Column field="url" header="Url" body={urlBodyTemplate}></Column>
                <Column field="date" header="Date" sortable style={{ width: '12rem' }}></Column>
                <Column body={actionBodyTemplate} exportable={false} style={{ minWidth: '8rem' }}></Column>
            </DataTable>

            <Dialog visible={tabDialog} breakpoints={{'960px': '75vw', '640px': '100vw'}} style={{width: '40vw'}} header="Tab Details" modal className="p-fluid" footer={tabDialogFooter} onHide={hideDialog}>
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

            <Dialog visible={deleteTabDialog} style={{ width: '450px' }} header="Confirm" modal footer={deleteTabDialogFooter} onHide={hideDeleteTabDialog}>
                <div className="flex align-items-center justify-content-center">
                    <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem'}} />
                    {tab && <span>Are you sure you want to delete <b>{tab.name}</b>?</span>}
                </div>
            </Dialog>

            <Dialog visible={deleteTabsDialog} style={{ width: '450px' }} header="Confirm" modal footer={deleteTabsDialogFooter} onHide={hideDeleteTabsDialog}>
                <div className="flex align-items-center justify-content-center">
                    <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem'}} />
                    {tab && <span>Are you sure you want to delete the selected tabs?</span>}
                </div>
            </Dialog>
        </div>
    );
}

export default App;
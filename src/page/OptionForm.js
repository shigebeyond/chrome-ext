import React, { useEffect, useState, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Checkbox } from 'primereact/checkbox';
import { Toast } from 'primereact/toast';
import { classNames } from 'primereact/utils';
import _ from 'lodash';
import store from '../lib/store'

// 存储的key
const storeKey = "options";

// 提前加载配置数据
const defaultValues = store.readStore(storeKey) || {
    notePostUrl: '',
    mqServerUrl: '',
    autoConnectMqServer: false
}

function OptionForm() {
    const toast = useRef(null);
    const [formData, setFormData] = useState({});

    useEffect(() => {
        // bug: HookForm　在　ComponentDidMount　时才加载数据，渲染时会导致 label　遮住input
        // fix: 看 defaultValues
        // let data = store.readStore(storeKey) || {}
        // console.log(data)
        // setFormData(data)
    }, []);

    const { control, formState: { errors }, handleSubmit, reset } = useForm({ defaultValues });

    const onSubmit = (data) => {
        setFormData(data);
        store.writeStore(storeKey, data)
        showToast('保存成功');

        //setTimeout(reset, 500); // 不用reset到上一次的数据
    };

    const getFormErrorMessage = (name) => {
        return errors[name] && <small className="p-error">{errors[name].message}</small>
    };

    const showToast = (msg, success = true) => {
        let label = success ? 'success' : 'error'
        toast.current.show({severity: label, summary: _.capitalize(label), detail: msg, life: 3000});
    }

    return (
        <div className="form-demo">
            <Toast ref={toast} />

            <div className="surface-card border-round shadow-2 p-4">
                <span className="text-900 text-2xl font-medium mb-4 block">Jktool 扩展选项配置</span>
                <form onSubmit={handleSubmit(onSubmit)} className="p-fluid">
                    <div className="mb-5">
                        <span className="p-float-label p-input-icon-right">
                            <i className="pi pi-envelope" />
                            <Controller name="notePostUrl" control={control}
                                rules={{ required: 'notePostUrl is required.', pattern: { value: /^https?:\/\/.+/i, message: 'Invalid http address. E.g. http://localhost/note.php' }}}
                                render={({ field, fieldState }) => (
                                    <InputText id={field.name} {...field} className={classNames({ 'p-invalid': fieldState.invalid })} />
                            )} />
                            <label htmlFor="notePostUrl" className={classNames({ 'p-error': !!errors.notePostUrl })}>网页剪报的提交地址*</label>
                        </span>
                        {getFormErrorMessage('notePostUrl')}
                    </div>
                    <div className="mb-5">
                        <span className="p-float-label p-input-icon-right">
                            <i className="pi pi-envelope" />
                            <Controller name="mqServerUrl" control={control}
                                rules={{ required: 'mqServerUrl is required.', pattern: { value: /^https?:\/\/.+/i, message: 'Invalid http address. E.g. http://localhost/note.php' }}}
                                render={({ field, fieldState }) => (
                                    <InputText id={field.name} {...field} className={classNames({ 'p-invalid': fieldState.invalid })} />
                            )} />
                            <label htmlFor="mqServerUrl" className={classNames({ 'p-error': !!errors.mqServerUrl })}>消息服务器地址*</label>
                        </span>
                        <a target="blank" href='https://gitee.com/shigebeyond/webredis'>了解消息服务器</a>
                        {getFormErrorMessage('mqServerUrl')}
                    </div>
                    <div className="mb-5 flex align-items-center">
                        <Controller name="autoConnectMqServer" control={control} render={({ field, fieldState }) => (
                            <Checkbox inputId={field.name} onChange={(e) => field.onChange(e.checked)} checked={field.value} className={classNames('mr-3', { 'p-invalid': fieldState.invalid })} />
                        )} />
                        <label htmlFor="autoConnectMqServer" className={classNames({ 'p-error': errors.autoConnectMqServer })}>自动连接消息服务器*</label>
                    </div>

                    <Button type="submit" label="保存" />
                </form>
            </div>
        </div>
    );
}

export default OptionForm;
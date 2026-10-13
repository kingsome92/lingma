import React, { useEffect, useRef, useState } from 'react';
import { AlertCircle, ArrowLeft, Check, ChevronRight, Mic, MoreHorizontal, Plus } from 'lucide-react';
import familyAvatarSprite from './assets/family-avatars.png';

export type VoiceProfile = { id: string; name: string; role: 'child' | 'adult'; registeredAt: string };
export const defaultVoiceProfiles: VoiceProfile[] = [
    { id: 'xiaole', name: '小乐', role: 'child', registeredAt: '2026-08-20' },
    { id: 'mama', name: '妈妈', role: 'adult', registeredAt: '2026-08-21' },
    { id: 'baba', name: '爸爸', role: 'adult', registeredAt: '2026-08-22' },
];
type Stage = 'list' | 'info' | 'collect' | 'success';
type Capture = 'ready' | 'recording' | 'failed' | 'permission';

function Avatar({ role, name }: { role: VoiceProfile['role']; name?: string }) {
    const avatarIndex = role === 'child'
        ? 0
        : name?.includes('妈妈')
            ? 1
            : name?.includes('爸爸')
                ? 2
                : name?.includes('爷爷')
                    ? 3
                    : name?.includes('奶奶')
                        ? 4
                        : 2;
    return <span
        className={`lingma-voice-avatar ${role}`}
        style={{ backgroundImage: `url(${familyAvatarSprite})`, '--lingma-avatar-position': `${avatarIndex * 25}%` } as React.CSSProperties}
        aria-hidden="true"
    />;
}

export default function VoiceManagement({ profiles, onChange, onBack }: {
    profiles: VoiceProfile[]; onChange: (next: VoiceProfile[]) => void; onBack: () => void;
}) {
    const [stage, setStage] = useState<Stage>('list');
    const [name, setName] = useState('');
    const [role, setRole] = useState<VoiceProfile['role']>();
    const [online, setOnline] = useState(false);
    const [original, setOriginal] = useState<VoiceProfile>();
    const [deleting, setDeleting] = useState<VoiceProfile>();
    const [capture, setCapture] = useState<Capture>('ready');
    const [progress, setProgress] = useState(0);
    const [help, setHelp] = useState(false);
    const cancelRef = useRef<HTMLButtonElement>(null);
    const previousDeleteRef = useRef<HTMLButtonElement | null>(null);
    const nickname = name.trim();
    const duplicate = profiles.some(p => p.id !== original?.id && p.name.trim() === nickname);
    const childTaken = profiles.some(p => p.id !== original?.id && p.role === 'child');
    const canProceed = Boolean(nickname && !duplicate && role && !(role === 'child' && childTaken) && online);

    useEffect(() => {
        if (stage !== 'collect' || capture !== 'recording') return;
        const start = Date.now();
        const timer = window.setInterval(() => {
            const percent = Math.min(100, Math.floor((Date.now() - start) / 100));
            setProgress(percent);
            if (percent === 100) { window.clearInterval(timer); setCapture('ready'); setStage('success'); }
        }, 100);
        return () => window.clearInterval(timer);
    }, [stage, capture]);

    useEffect(() => {
        if (!deleting) { previousDeleteRef.current?.focus(); return; }
        cancelRef.current?.focus();
        const escape = (event: KeyboardEvent) => { if (event.key === 'Escape') setDeleting(undefined); };
        document.addEventListener('keydown', escape);
        return () => document.removeEventListener('keydown', escape);
    }, [deleting]);

    function start(profile?: VoiceProfile) {
        if (!profile && profiles.length >= 10) return;
        setOriginal(profile); setName(profile?.name || ''); setRole(profile?.role);
        setOnline(false); setCapture('ready'); setProgress(0); setStage('info');
    }
    function record() { setProgress(0); setCapture('recording'); }
    function back() {
        if (stage === 'list') onBack();
        else if (stage === 'collect') { setCapture('ready'); setProgress(0); setStage('info'); }
        else setStage('list');
    }
    function finish() {
        if (!canProceed || (!original && profiles.length >= 10)) return;
        const now = new Date();
        const date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
        const profile: VoiceProfile = { id: original?.id || `voice-${Date.now()}`, name: nickname, role: role!, registeredAt: date };
        onChange(original ? profiles.map(p => p.id === original.id ? profile : p) : [...profiles, profile]);
        setStage('list');
    }
    const step = stage === 'info' ? 1 : stage === 'collect' ? 2 : 3;
    return <main className="lingma-device-page lingma-voice-page">
        <div className="lingma-chrome"><button className="lingma-back-button" type="button" onClick={back} aria-label={stage === 'list' ? '返回设备管理' : stage === 'collect' ? '返回修改信息' : '返回声纹管理'}><ArrowLeft size={24} /></button><h1>{stage === 'list' ? '声纹管理' : original ? '重录声纹' : '注册声纹'}</h1><div className="lingma-system-menu" aria-hidden="true"><MoreHorizontal size={21} /><span /><i className="lingma-system-circle" /></div></div>
        {stage === 'list' ? <>
            <section className="lingma-voice-intro"><Mic size={24} /><p>声纹注册后，小乐能听声识人，为不同家人提供专属对话体验。</p></section>
            <div className="lingma-voice-list-heading"><strong>声纹列表</strong><span>{profiles.length}<small>/10</small></span></div>
            {profiles.length ? <div className="lingma-voice-list">{profiles.map(profile => <article className="lingma-voice-profile" key={profile.id}><Avatar role={profile.role} name={profile.name} /><div><h2>{profile.name}<em className={profile.role}>{profile.role === 'child' ? '儿童' : '成人'}</em></h2><p>注册于 {profile.registeredAt}</p></div><button type="button" onClick={() => start(profile)} aria-label={`重录${profile.name}的声纹`}>重录</button><button type="button" className="is-danger" onClick={event => { previousDeleteRef.current = event.currentTarget; setDeleting(profile); }} aria-label={`删除${profile.name}的声纹`}>删除</button></article>)}</div> : <section className="lingma-voice-empty"><Mic size={48} /><strong>还没有注册声纹</strong><p>注册后小乐就能听声识人<br />为每位家人提供专属对话体验</p></section>}
            <p className="lingma-voice-note"><AlertCircle size={14} />未注册的声纹会自动识别为“访客”</p>
            <button className="lingma-text-button lingma-state-help" type="button" onClick={() => setHelp(!help)} aria-expanded={help}>查看特殊状态说明<ChevronRight size={14} /></button>
            {help && <section className="lingma-voice-help"><h2>声纹注册说明</h2><p>最多可注册 10 人，其中儿童仅支持一位。达到上限后，需先删除一个声纹再注册。</p><p>昵称不可重复。重录成功后才更新原声纹，中途退出或采集失败不会覆盖已有数据。</p><p>无法录音时，请在小程序设置中开启录音权限。采集失败后可重新采集，或返回修改信息。</p></section>}
            <button className="lingma-primary-button lingma-voice-register-button" type="button" disabled={profiles.length >= 10} onClick={() => start()}>{profiles.length >= 10 ? '名额已满（10/10）' : <><Plus size={20} />注册声纹</>}</button>
        </> : <>
            <div className="lingma-voice-steps" aria-label={`声纹注册第${step}步`}>{['填写信息', '玩偶采集', '完成'].map((label, index) => <React.Fragment key={label}><div className={`lingma-voice-step ${index + 1 === step ? 'is-current' : ''} ${index + 1 < step ? 'is-complete' : ''}`}><span>{index + 1 < step ? <Check size={16} /> : index + 1}</span><b>{label}</b></div>{index < 2 && <i className={index + 1 < step ? 'is-complete' : ''} />}</React.Fragment>)}</div>
            {stage === 'info' && <><section className="lingma-voice-form-card"><label htmlFor="voice-nickname">昵称</label><input id="voice-nickname" value={name} maxLength={20} onChange={event => setName(event.target.value)} placeholder="请输入家人昵称，如：小乐/妈妈" aria-invalid={duplicate} aria-describedby={duplicate ? 'voice-name-error' : undefined} />{duplicate && <p id="voice-name-error" className="lingma-field-error" role="alert"><AlertCircle size={14} />“{nickname}”昵称已存在，请换一个吧！</p>}</section><section className="lingma-voice-form-card"><fieldset><legend>角色</legend><div className="lingma-role-options">{(['child', 'adult'] as const).map(option => <button key={option} type="button" className={role === option ? 'is-selected' : ''} disabled={option === 'child' && childTaken} aria-pressed={role === option} onClick={() => setRole(option)}><Avatar role={option} />{role === option && <Check className="lingma-role-check" size={18} />}<strong>{option === 'child' ? '儿童' : '成人'}</strong><small>{option === 'child' ? '仅可注册一位' : '爸爸妈妈等家人'}</small></button>)}</div><p className="lingma-role-warning"><AlertCircle size={14} />{childTaken ? '已有儿童声纹，儿童仅可注册一位' : '儿童声纹仅可注册一位'}</p></fieldset></section><label className={`lingma-online-check ${online ? 'is-checked' : ''}`}><input type="checkbox" checked={online} onChange={event => setOnline(event.target.checked)} /><span><Check size={16} /></span><b>请确认小乐玩偶已开机并联网</b><small>保持环境安静，距离玩偶 0.5-1 米</small></label><button className="lingma-primary-button lingma-voice-next" type="button" disabled={!canProceed} onClick={() => { setStage('collect'); record(); }}>下一步</button></>}
            {stage === 'collect' && <section className="lingma-voice-collect-card"><div className={`lingma-mic-illustration ${capture === 'recording' ? 'is-recording' : ''}`}><Mic size={62} /></div><p>请让小乐听到 TA 的声音，对着玩偶说：</p><strong>小乐，你好呀！我是{nickname}！</strong>{capture === 'recording' ? <><div className="lingma-voice-progress" role="progressbar" aria-label="声纹采集进度" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}><svg viewBox="0 0 120 120" aria-hidden="true"><circle cx="60" cy="60" r="50" /><circle cx="60" cy="60" r="50" style={{ strokeDasharray: `${progress * 3.142} 314.2` }} /></svg><b>{progress}%</b><small>正在拾音</small></div><button className="lingma-text-button" type="button" onClick={() => setCapture('failed')}>没有采集到声音？</button><button className="lingma-text-button" type="button" onClick={() => setCapture('permission')}>无法录音？</button></> : capture === 'permission' ? <div className="lingma-voice-result is-failed" role="status"><AlertCircle size={44} /><h2>请开启录音权限</h2><p>小程序录音权限未开启，请前往<br />微信小程序设置，允许使用麦克风。</p><button type="button" onClick={record}>已开启，重新采集</button><button type="button" className="lingma-outline-button" onClick={back}>返回修改信息</button></div> : <div className="lingma-voice-result is-failed" role="status"><AlertCircle size={44} /><h2>声纹采集失败</h2><p>没有听清声音，请在安静的环境中<br />让 TA 靠近玩偶再试一次</p><button type="button" onClick={record}>重新采集</button><button type="button" className="lingma-outline-button" onClick={back}>返回修改信息</button></div>}</section>}
            {stage === 'success' && <section className="lingma-voice-success-card" role="status"><div className="lingma-mic-illustration"><Mic size={62} /></div><p className="lingma-voice-success-guide">请让小乐听到 TA 的声音，对着玩偶说：<br /><strong>小乐，你好呀！我是{nickname}！</strong></p><div className="lingma-success-icon"><Check size={44} /></div><h2>{original ? '声纹重录成功！' : '声纹注册成功！'}</h2><p>小乐已经记住 TA 的声音啦</p><button className="lingma-primary-button" type="button" onClick={finish}>完成</button></section>}
        </>}
        {deleting && <div className="lingma-modal-backdrop"><section className="lingma-confirm-modal" role="dialog" aria-modal="true" aria-labelledby="voice-delete-title" aria-describedby="voice-delete-message" onKeyDown={event => { if (event.key === 'Tab') { event.preventDefault(); const buttons = event.currentTarget.querySelectorAll('button'); (document.activeElement === buttons[0] ? buttons[1] : buttons[0]).focus(); } }}><h2 id="voice-delete-title">删除声纹</h2><p id="voice-delete-message">删除后小乐将无法识别 {deleting.name} 的声音，需要重新采集才能恢复。</p><div><button ref={cancelRef} type="button" className="lingma-outline-button" onClick={() => setDeleting(undefined)}>取消</button><button type="button" className="lingma-danger-button" onClick={() => { onChange(profiles.filter(p => p.id !== deleting.id)); setDeleting(undefined); }}>确认删除</button></div></section></div>}
    </main>;
}

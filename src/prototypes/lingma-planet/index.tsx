/**
 * @name 灵玛星球小程序
 */

import React, { useEffect, useRef, useState } from 'react';
import {
    AlarmClock,
    ArrowLeft,
    ArrowRight,
    ArrowRightLeft,
    CirclePlus,
    ClipboardList,
    Copy,
    Gauge,
    Headphones,
    ListChecks,
    MapPin,
    MessageCircle,
    MoreHorizontal,
    Moon,
    Network,
    Power,
    Radio,
    Settings2,
    Smile,
    Sparkles,
    Sprout,
    Target,
    UserRound,
    Volume2,
    WifiOff,
} from 'lucide-react';
import { defineHashPageRoute, useHashPage } from '../../common/useHashPage';
import './style.css';

import deviceAvatar from './assets/device-avatar.png';
import referenceChild from './assets/reference-child.png';
import referenceMascot from './assets/reference-mascot.png';

const route = defineHashPageRoute([
    { id: 'home', title: '成长中心首页' },
    { id: 'device', title: '设备管理' },
], { defaultPageId: 'home' });

const toolItems = [
    { label: '聊天记录', icon: MessageCircle, badge: '99+' },
    { label: '孩子的心情', icon: Smile, badge: '10' },
    { label: '孩子的闪光点', icon: Sparkles, badge: 'New' },
    { label: '成长报告', icon: ClipboardList, badge: '' },
    { label: '闹钟提醒', icon: AlarmClock, badge: '' },
    { label: '成长目标', icon: Target, badge: '' },
];

function MiniProgramChrome({ title, onBack }: { title?: string; onBack?: () => void }) {
    return (
        <div className="lingma-chrome">
            {onBack ? (
                <button className="lingma-back-button" type="button" onClick={onBack} aria-label="返回成长中心">
                    <ArrowLeft size={24} strokeWidth={2.2} />
                </button>
            ) : (
                null
            )}
            {title && <h1>{title}</h1>}
            <div className="lingma-system-menu" aria-hidden="true">
                <MoreHorizontal size={21} />
                <span />
                <CirclePlus size={21} />
            </div>
        </div>
    );
}

const deviceMenuItems = [
    { label: '设备管理', icon: Settings2 },
    { label: '语音留言', icon: MessageCircle },
    { label: '内容拦截', icon: ListChecks },
    { label: '睡眠提醒', icon: Moon },
    { label: '成长测评', icon: ClipboardList },
];

function HomePage({ goToDevice }: { goToDevice: () => void }) {
    const [deviceMenuOpen, setDeviceMenuOpen] = useState(false);
    const deviceControlsRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleOutsidePointerDown = (event: PointerEvent) => {
            if (!deviceControlsRef.current?.contains(event.target as Node)) {
                setDeviceMenuOpen(false);
            }
        };
        document.addEventListener('pointerdown', handleOutsidePointerDown);
        return () => document.removeEventListener('pointerdown', handleOutsidePointerDown);
    }, []);

    return (
        <main className="lingma-home-page">
            <section className="lingma-home-dashboard">
                <MiniProgramChrome />
                <div className="lingma-brand-pill"><span>灵玛乐园</span><i /><i /><i /></div>
                <div ref={deviceControlsRef} className="lingma-device-controls">
                    <div className="lingma-bound-actions" aria-label="已绑定设备入口">
                        <button className="lingma-bound-avatar" type="button" onClick={goToDevice} aria-label="打开小乐设备">
                            <img src={deviceAvatar} alt="小乐头像" />
                        </button>
                        <button className={deviceMenuOpen ? 'is-selected' : ''} type="button" onClick={() => setDeviceMenuOpen((open) => !open)} aria-label="设备功能菜单" aria-expanded={deviceMenuOpen}>
                            <Settings2 size={23} strokeWidth={2.2} />
                        </button>
                        <button type="button" onClick={() => setDeviceMenuOpen(false)} aria-label="添加设备">
                            <CirclePlus size={25} strokeWidth={2.2} />
                        </button>
                    </div>
                    {deviceMenuOpen && (
                        <div className="lingma-device-menu" role="menu" aria-label="小乐设备功能">
                            {deviceMenuItems.map(({ label, icon: Icon }, index) => (
                                <button key={label} type="button" role="menuitem" onClick={index === 0 ? goToDevice : undefined}>
                                    <Icon size={28} strokeWidth={1.8} />
                                    <span>{label}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
                <div className="lingma-bound-device-name">V5测试</div>
                <div className="lingma-bound-card">
                    <div className="lingma-bound-card-copy">
                        <p className="lingma-bound-greeting">亲爱的 V5测试</p>
                        <p className="lingma-bound-description">V5测试现在正处于安全与依恋的奠基期，建议您：及时回应、稳定陪伴，给足孩子安全感与依恋。</p>
                    </div>
                    <div className="lingma-bound-child-scene">
                        <img src={referenceChild} alt="趴在卡片边缘的小孩插画" />
                        <button className="lingma-voice-memory" type="button">
                            <Radio size={24} strokeWidth={2.2} />
                            <span>童言拾光</span>
                            <ArrowRight size={18} />
                            <b>4</b>
                        </button>
                    </div>
                </div>
            </section>

            <div className="lingma-home-spacer" aria-hidden="true" />
            <img className="lingma-mascot" src={referenceMascot} alt="阅读中的玩偶插画" />
            <button className="lingma-service-button" type="button" aria-label="联系客服">
                <Headphones size={30} strokeWidth={1.8} />
                <span>客服</span>
            </button>

            <section className="lingma-tool-panel" aria-label="成长工具">
                {toolItems.map(({ label, icon: Icon, badge }, index) => (
                    <button
                        className="lingma-tool-item"
                        type="button"
                        key={label}
                        onClick={index === 3 ? goToDevice : undefined}
                    >
                        {badge && <span className="lingma-tool-badge">{badge}</span>}
                        <Icon size={28} strokeWidth={1.8} />
                        <span>{label}</span>
                    </button>
                ))}
            </section>

            <nav className="lingma-bottom-nav" aria-label="小程序底部导航">
                <button className="is-active" type="button"><Sprout size={28} /><span>成长中心</span></button>
                <button type="button"><MapPin size={28} /><span>探索</span></button>
                <button type="button"><UserRound size={28} /><span>阿乐</span></button>
                <button type="button"><MessageCircle size={28} /><span>家长圈</span></button>
                <button type="button"><UserRound size={28} /><span>我的</span></button>
            </nav>
        </main>
    );
}

function SettingCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
    return <section className={`lingma-setting-card ${className}`}>{children}</section>;
}

function RangeControl({ label, description, minLabel, maxLabel, value, onChange }: {
    label: string;
    description?: string;
    minLabel: string;
    maxLabel: string;
    value: number;
    onChange: (value: number) => void;
}) {
    return (
        <SettingCard>
            <div className="lingma-setting-title-row">
                <div className="lingma-setting-label"><Gauge size={22} /><strong>{label}</strong></div>
                <span className="lingma-setting-hint">调节后需重新开机</span>
            </div>
            {description && <p className="lingma-setting-description">{description}</p>}
            <input
                className="lingma-range"
                type="range"
                min={1}
                max={5}
                value={value}
                onChange={(event) => onChange(Number(event.target.value))}
                aria-label={label}
            />
            <div className="lingma-range-labels"><span>{minLabel}</span><span>较弱</span><span>正常</span><span>较强</span><span>{maxLabel}</span></div>
        </SettingCard>
    );
}

function DevicePage({ goHome }: { goHome: () => void }) {
    const [voiceSpeed, setVoiceSpeed] = useState(3);
    const [volume, setVolume] = useState(3);
    const [isOn, setIsOn] = useState(false);
    const [activeConversation, setActiveConversation] = useState(true);
    const [conversationInterval, setConversationInterval] = useState(30);
    const [activeTab, setActiveTab] = useState<'basic' | 'system'>('basic');

    return (
        <main className="lingma-device-page">
            <MiniProgramChrome title="设备管理" onBack={goHome} />
            <section className="lingma-device-profile">
                <img src={deviceAvatar} alt="小乐头像" />
                <div><h2>V5测试的小乐 <Settings2 size={17} /></h2><p>主人昵称：V5测试 <Copy size={16} /></p></div>
                <button type="button" aria-label="切换设备"><ArrowRightLeft size={20} /></button>
            </section>

            <div className="lingma-device-tabs" role="tablist" aria-label="设备设置分类">
                <button className={activeTab === 'basic' ? 'is-active' : ''} type="button" role="tab" aria-selected={activeTab === 'basic'} onClick={() => setActiveTab('basic')}>基础设置</button>
                <button className={activeTab === 'system' ? 'is-active' : ''} type="button" role="tab" aria-selected={activeTab === 'system'} onClick={() => setActiveTab('system')}>系统参数</button>
            </div>
            {activeTab === 'basic' && <div role="tabpanel" aria-label="基础设置">
            <SettingCard>
                <div className="lingma-setting-title-row">
                    <div className="lingma-setting-label"><Moon size={22} /><strong>小乐正在睡梦中，请开机~</strong></div>
                    <span className="lingma-setting-status"><Power size={20} /> 关灯</span>
                </div>
                <p className="lingma-setting-description compact">已关机</p>
            </SettingCard>
            <SettingCard>
                <div className="lingma-setting-title-row">
                    <div className="lingma-setting-label"><Network size={22} /><strong>网络断开</strong></div>
                    <span className="lingma-setting-status"><WifiOff size={20} /> 未连接</span>
                </div>
                <p className="lingma-setting-description compact">网络设置</p>
            </SettingCard>
            <SettingCard className={!activeConversation ? 'is-disabled' : ''}>
                <div className="lingma-setting-title-row">
                    <div className="lingma-setting-label"><MessageCircle size={22} /><strong>主动对话</strong></div>
                    <button
                        className={`lingma-toggle ${activeConversation ? 'is-on' : ''}`}
                        type="button"
                        onClick={() => setActiveConversation((current) => !current)}
                        aria-label="切换主动对话"
                        aria-pressed={activeConversation}
                    >
                        <span />
                    </button>
                </div>
                <p className="lingma-setting-description">开启后，小乐会在一段时间没有互动时主动发起攀谈，攀谈总次数为3次。</p>
                <div className="lingma-conversation-frequency">
                    <span>主动攀谈频次</span>
                    <strong>{activeConversation ? `静默 ${conversationInterval} 秒` : '已关闭'}</strong>
                </div>
                <input
                    className="lingma-range"
                    type="range"
                    min={10}
                    max={60}
                    step={10}
                    value={conversationInterval}
                    disabled={!activeConversation}
                    onChange={(event) => setConversationInterval(Number(event.target.value))}
                    aria-label="主动对话频次"
                />
                <div className="lingma-range-labels"><span>10秒</span><span>20秒</span><span>30秒</span><span>40秒</span><span>60秒</span></div>
            </SettingCard>
            <SettingCard>
                <div className="lingma-setting-title-row">
                    <div className="lingma-setting-label"><Headphones size={22} /><strong>接话速度</strong></div>
                    <button className={`lingma-toggle ${isOn ? 'is-on' : ''}`} type="button" onClick={() => setIsOn((current) => !current)} aria-label="切换接话速度开关"><span /></button>
                </div>
                <p className="lingma-setting-description">接话速度越快小乐会越积极回应您，但可能会导致您的说话被打断，请根据您的体验选择速度。</p>
                <input className="lingma-range" type="range" min={1} max={5} value={voiceSpeed} onChange={(event) => setVoiceSpeed(Number(event.target.value))} aria-label="接话速度" />
                <div className="lingma-range-labels"><span>很慢</span><span>慢</span><span>正常</span><span>快</span><span>很快</span></div>
            </SettingCard>
            <RangeControl label="音量" minLabel="哄睡" maxLabel="响亮" value={volume} onChange={setVolume} />
            </div>}

            {activeTab === 'system' && <div role="tabpanel" aria-label="系统参数">
            <SettingCard className="lingma-parameter-card">
                <div className="lingma-parameter-row"><span>设备 ID</span><strong>14:c1:9f:d6:e7:84 <Copy size={17} /></strong></div>
                <p>反馈问题时，平台客服可能会需要该ID进行问题定位</p>
                <div className="lingma-parameter-row"><span>当前版本</span><strong>1.1.5</strong></div>
                <div className="lingma-parameter-row"><span>陪伴时长</span><strong>39天</strong></div>
                <button className="lingma-unbind-row" type="button"><span>解除绑定</span><ArrowRightLeft size={18} /></button>
            </SettingCard>
            </div>}
        </main>
    );
}

export default function LingmaPlanet() {
    const { page, setPage } = useHashPage(route);
    return page === 'device'
        ? <DevicePage goHome={() => setPage('home')} />
        : <HomePage goToDevice={() => setPage('device')} />;
}

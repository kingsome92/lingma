/**
 * @name 灵玛星球小程序
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AnnotationViewer, setProtoDevState, useProtoDevState } from '@axhub/annotation';
import type { AnnotationSourceDocument, AnnotationViewerOptions } from '@axhub/annotation';
import annotationSourceDocument from './annotation-source.json';
import {
    AlarmClock,
    ArrowLeft,
    ArrowRight,
    ArrowRightLeft,
    CirclePlus,
    ClipboardList,
    Copy,
    BookOpen,
    Filter,
    Gauge,
    Headphones,
    ListMusic,
    Mic,
    ChevronRight,
    ListChecks,
    MapPin,
    MessageCircle,
    MoreHorizontal,
    Moon,
    Network,
    Pause,
    Power,
    Radio,
    Play,
    Search,
    Settings2,
    Smile,
    Sparkles,
    Sprout,
    SkipBack,
    SkipForward,
    Target,
    UserRound,
    Volume2,
    WifiOff,
} from 'lucide-react';
import { defineHashPageRoute, useHashPage } from '../../common/useHashPage';
import './style.css';
import VoiceManagement, { defaultVoiceProfiles } from './VoiceManagement';
import type { VoiceProfile } from './VoiceManagement';

import deviceAvatar from './assets/device-avatar.png';
import referenceChild from './assets/reference-child.png';
import referenceMascot from './assets/reference-mascot.png';

const route = defineHashPageRoute([
    { id: 'home', title: '成长中心首页' },
    { id: 'device', title: '设备管理' },
    { id: 'audio', title: '贝瓦音乐' },
    { id: 'album', title: '专辑详情' },
], { defaultPageId: 'home' });

type LingmaProtoState = {
    lingma_menu_open?: boolean;
    lingma_settings_tab?: 'basic' | 'system';
    lingma_conversation_on?: boolean;
    lingma_conversation_interval?: number;
    lingma_speed_on?: boolean;
    lingma_voice_speed?: number;
    lingma_volume?: number;
    lingma_voice_view?: 'list' | null;
    lingma_voice_profiles?: VoiceProfile[];
    lingma_audio_query?: string;
    lingma_audio_category?: string;
    lingma_audio_album?: string;
    lingma_audio_track?: string;
    lingma_audio_playing?: boolean;
};

function rangeValue(value: unknown, fallback: number, min: number, max: number, step = 1) {
    return typeof value === 'number' && Number.isFinite(value)
        ? Math.min(max, Math.max(min, min + Math.round((value - min) / step) * step))
        : fallback;
}

type AudioTrack = {
    id: string;
    title: string;
    album: string;
    category: string;
    duration: string;
    description?: string;
    url?: string;
};

type AudioAlbum = {
    id: string;
    title: string;
    category: string;
    count: number;
    tone: string;
    tracks: AudioTrack[];
};

const audioCategories = ['全部', '音乐', '故事', '国学/诗词', '科普/知识', '亲子教育', '其他'];
const audioAlbums: AudioAlbum[] = [
    {
        id: 'beiwa-selected', title: '贝瓦儿歌精选集', category: '音乐', count: 108, tone: 'mint',
        tracks: [
            { id: 'spring', title: '春天在哪里', album: '贝瓦儿歌精选集', category: '音乐', duration: '03:18', url: 'http://music.163.com/song/media/outer/url?id=1417892393.mp3', description: '轻快明亮的春日儿歌，适合亲子共听。' },
            { id: 'beijing', title: '我爱北京天安门', album: '贝瓦儿歌精选集', category: '音乐', duration: '02:14', url: 'http://music.163.com/song/media/outer/url?id=1450709452.mp3', description: '经典儿童歌曲，适合亲子跟唱。' },
            { id: 'swallow', title: '小燕子', album: '贝瓦儿歌精选集', category: '音乐', duration: '02:06', url: 'http://music.163.com/song/media/outer/url?id=1417885734.mp3', description: '轻快熟悉的春日儿歌，适合亲子共听。' },
            { id: 'little-star', title: '小星星', album: '贝瓦儿歌精选集', category: '音乐', duration: '02:21' },
            { id: 'birthday', title: '生日快乐', album: '贝瓦儿歌精选集', category: '音乐', duration: '02:08' },
        ],
    },
    {
        id: 'classics', title: '新儿歌特辑', category: '音乐', count: 172, tone: 'sun',
        tracks: [
            { id: 'good-morning', title: '早上好', album: '新儿歌特辑', category: '音乐', duration: '02:42' },
            { id: 'little-donkey', title: '小毛驴', album: '新儿歌特辑', category: '音乐', duration: '02:16' },
        ],
    },
    {
        id: 'stories', title: '中国上下五千年', category: '故事', count: 393, tone: 'peach',
        tracks: [
            { id: 'three-kingdoms', title: '三国故事：桃园结义', album: '中国上下五千年', category: '故事', duration: '08:42' },
            { id: 'great-wall', title: '万里长城的故事', album: '中国上下五千年', category: '故事', duration: '07:35' },
        ],
    },
    {
        id: 'poems', title: '唐诗', category: '国学/诗词', count: 80, tone: 'lavender',
        tracks: [
            { id: 'quiet-night', title: '静夜思', album: '唐诗', category: '国学/诗词', duration: '03:06' },
            { id: 'ascending-stork', title: '登鹳雀楼', album: '唐诗', category: '国学/诗词', duration: '02:52' },
        ],
    },
    {
        id: 'science', title: '科学奇遇记·星球保护计划', category: '科普/知识', count: 98, tone: 'blue',
        tracks: [
            { id: 'planet-home', title: '我们的蓝色星球', album: '科学奇遇记·星球保护计划', category: '科普/知识', duration: '06:12' },
            { id: 'recycle', title: '垃圾去哪儿了', album: '科学奇遇记·星球保护计划', category: '科普/知识', duration: '05:48' },
        ],
    },
    {
        id: 'english', title: '经典英语儿歌3', category: '其他', count: 134, tone: 'lemon',
        tracks: [
            { id: 'sleeping', title: 'Are You Sleeping', album: '经典英语儿歌3', category: '其他', duration: '02:36' },
            { id: 'lamb', title: 'Mary Had a Little Lamb', album: '经典英语儿歌3', category: '其他', duration: '02:30' },
        ],
    },
];

const allAudioTracks = audioAlbums.flatMap((album) => album.tracks);
const getAudioAlbum = (id?: string) => audioAlbums.find((album) => album.id === id) || audioAlbums[0];
const getAudioTrack = (id?: string) => allAudioTracks.find((track) => track.id === id) || allAudioTracks[0];

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

function HomePage({ goToDevice, goToAudio }: { goToDevice: () => void; goToAudio: () => void }) {
    const protoState = useProtoDevState<LingmaProtoState>();
    const deviceMenuOpen = protoState.lingma_menu_open === true;
    const setDeviceMenuOpen = (open: boolean) => setProtoDevState({ lingma_menu_open: open });
    const deviceControlsRef = useRef<HTMLDivElement>(null);
    const [servicePosition, setServicePosition] = useState<{ left: number; top: number } | null>(null);
    const serviceDragRef = useRef<{
        pointerId: number;
        page: HTMLElement;
        offsetX: number;
        offsetY: number;
    } | null>(null);

    useEffect(() => {
        const handleOutsidePointerDown = (event: PointerEvent) => {
            if (!deviceControlsRef.current?.contains(event.target as Node)) {
                setDeviceMenuOpen(false);
            }
        };
        document.addEventListener('pointerdown', handleOutsidePointerDown);
        return () => document.removeEventListener('pointerdown', handleOutsidePointerDown);
    }, []);

    const handleServicePointerDown = (event: React.PointerEvent<HTMLButtonElement>) => {
        if (event.button !== 0) return;
        const page = event.currentTarget.closest('.lingma-home-page') as HTMLElement | null;
        if (!page) return;
        const pageRect = page.getBoundingClientRect();
        const buttonRect = event.currentTarget.getBoundingClientRect();
        serviceDragRef.current = {
            pointerId: event.pointerId,
            page,
            offsetX: event.clientX - buttonRect.left,
            offsetY: event.clientY - buttonRect.top,
        };
        setServicePosition({
            left: buttonRect.left - pageRect.left,
            top: buttonRect.top - pageRect.top,
        });
        event.currentTarget.setPointerCapture(event.pointerId);
    };

    const handleServicePointerMove = (event: React.PointerEvent<HTMLButtonElement>) => {
        const drag = serviceDragRef.current;
        if (!drag || drag.pointerId !== event.pointerId) return;
        const pageRect = drag.page.getBoundingClientRect();
        const button = event.currentTarget;
        const maxLeft = Math.max(0, drag.page.clientWidth - button.offsetWidth);
        const maxTop = Math.max(0, drag.page.clientHeight - button.offsetHeight);
        const left = Math.min(maxLeft, Math.max(0, event.clientX - pageRect.left - drag.offsetX));
        const top = Math.min(maxTop, Math.max(0, event.clientY - pageRect.top - drag.offsetY));
        setServicePosition({ left, top });
    };

    const handleServicePointerEnd = (event: React.PointerEvent<HTMLButtonElement>) => {
        if (serviceDragRef.current?.pointerId !== event.pointerId) return;
        serviceDragRef.current = null;
        if (event.currentTarget.hasPointerCapture(event.pointerId)) {
            event.currentTarget.releasePointerCapture(event.pointerId);
        }
    };

    return (
        <main className="lingma-home-page">
            <section className="lingma-home-dashboard">
                <MiniProgramChrome />
                <div className="lingma-brand-pill" data-annotation-id="home-brand"><span>灵玛乐园</span><i /><i /><i /></div>
                <div ref={deviceControlsRef} className="lingma-device-controls">
                    <div className="lingma-bound-actions" aria-label="已绑定设备入口" data-annotation-id="home-device-actions">
                        <button className="lingma-bound-avatar" type="button" onClick={goToDevice} aria-label="打开小乐设备">
                            <img src={deviceAvatar} alt="小乐头像" />
                        </button>
                        <button className={deviceMenuOpen ? 'is-selected' : ''} type="button" onClick={() => setDeviceMenuOpen(!deviceMenuOpen)} aria-label="设备功能菜单" aria-expanded={deviceMenuOpen}>
                            <Settings2 size={23} strokeWidth={2.2} />
                        </button>
                        <button type="button" onClick={() => setDeviceMenuOpen(false)} aria-label="添加设备">
                            <CirclePlus size={25} strokeWidth={2.2} />
                        </button>
                    </div>
                    {deviceMenuOpen && (
                        <div className="lingma-device-menu" role="menu" aria-label="小乐设备功能" data-annotation-id="home-device-menu">
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
                <div className="lingma-bound-card" data-annotation-id="home-growth-summary">
                    <div className="lingma-bound-card-copy">
                        <p className="lingma-bound-greeting">亲爱的 V5测试</p>
                        <p className="lingma-bound-description">V5测试现在正处于安全与依恋的奠基期，建议您：及时回应、稳定陪伴，给足孩子安全感与依恋。</p>
                    </div>
                    <div className="lingma-bound-child-scene">
                        <img src={referenceChild} alt="趴在卡片边缘的小孩插画" />
                        <button className="lingma-voice-memory" type="button" data-annotation-id="home-voice-memory">
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
            <button
                className="lingma-service-button"
                type="button"
                aria-label="联系客服"
                data-annotation-id="home-service"
                style={servicePosition ? { left: servicePosition.left, top: servicePosition.top, right: 'auto' } : undefined}
                onPointerDown={handleServicePointerDown}
                onPointerMove={handleServicePointerMove}
                onPointerUp={handleServicePointerEnd}
                onPointerCancel={handleServicePointerEnd}
            >
                <Headphones size={30} strokeWidth={1.8} />
                <span>客服</span>
            </button>

            <button className="lingma-audio-entry" type="button" onClick={goToAudio} data-annotation-id="home-audio-entry">
                <span className="lingma-audio-entry-icon"><Headphones size={24} strokeWidth={2} /></span>
                <span className="lingma-audio-entry-copy"><strong>贝瓦音乐</strong><small>儿歌、故事与国学陪伴</small></span>
                <span className="lingma-audio-entry-action"><Play size={15} fill="currentColor" /> <ChevronRight size={18} /></span>
            </button>

            <section className="lingma-tool-panel" aria-label="成长工具" data-annotation-id="home-growth-tools">
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

            <nav className="lingma-bottom-nav" aria-label="小程序底部导航" data-annotation-id="home-navigation">
                <button className="is-active" type="button"><Sprout size={28} /><span>成长中心</span></button>
                <button type="button"><MapPin size={28} /><span>探索</span></button>
                <button type="button"><UserRound size={28} /><span>阿乐</span></button>
                <button type="button"><MessageCircle size={28} /><span>家长圈</span></button>
                <button type="button"><UserRound size={28} /><span>我的</span></button>
            </nav>
        </main>
    );
}

function AudioMiniPlayer({ track, playing, onToggle, onBack, onForward, onOpen }: {
    track: AudioTrack;
    playing: boolean;
    onToggle: () => void;
    onBack: () => void;
    onForward: () => void;
    onOpen?: () => void;
}) {
    return (
        <div className="lingma-audio-mini-player" data-annotation-id="audio-mini-player">
            <button className="lingma-audio-mini-art" type="button" onClick={onOpen} aria-label="展开播放器"><Volume2 size={20} /></button>
            <button className="lingma-audio-mini-copy" type="button" onClick={onOpen}>
                <strong>{track.title}</strong><small>{track.album}</small>
            </button>
            <button type="button" className="lingma-audio-mini-skip" onClick={onBack} aria-label="上一首"><SkipBack size={17} /></button>
            <button type="button" className="lingma-audio-mini-play" onClick={onToggle} aria-label={playing ? '暂停播放' : '开始播放'}>{playing ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}</button>
            <button type="button" className="lingma-audio-mini-skip" onClick={onForward} aria-label="下一首"><SkipForward size={17} /></button>
        </div>
    );
}

const albumCoverMeta: Record<string, { label: string; icon: React.ReactNode }> = {
    'beiwa-selected': { label: 'SONGS', icon: <Headphones size={28} /> },
    classics: { label: 'CLASSICS', icon: <Sparkles size={28} /> },
    stories: { label: 'STORY', icon: <BookOpen size={28} /> },
    poems: { label: 'POETRY', icon: <Sprout size={28} /> },
    science: { label: 'DISCOVER', icon: <Target size={28} /> },
    english: { label: 'ABC', icon: <MessageCircle size={28} /> },
    featured: { label: 'PLAY', icon: <Headphones size={30} /> },
};

function AlbumCover({ tone, variant = 'featured', icon }: { tone: string; variant?: string; icon?: React.ReactNode }) {
    const meta = albumCoverMeta[variant] || albumCoverMeta.featured;
    return (
        <span className={`lingma-album-cover ${tone} is-${variant}`} aria-hidden="true">
            <span className="lingma-album-cover-orbit" />
            <span className="lingma-album-cover-spark spark-one" />
            <span className="lingma-album-cover-spark spark-two" />
            <span className="lingma-album-cover-icon">{icon || meta.icon}</span>
            <span className="lingma-album-cover-label">{meta.label}</span>
        </span>
    );
}

function AudioPage({ goHome, goAlbum }: { goHome: () => void; goAlbum: (albumId: string) => void }) {
    const protoState = useProtoDevState<LingmaProtoState>();
    const audioRef = useRef<HTMLAudioElement>(null);
    const query = protoState.lingma_audio_query || '';
    const category = protoState.lingma_audio_category || '全部';
    const track = getAudioTrack(protoState.lingma_audio_track);
    const playing = protoState.lingma_audio_playing === true;
    const setAudio = (next: Partial<LingmaProtoState>) => setProtoDevState(next);
    const visibleAlbums = audioAlbums.filter((album) => {
        const categoryMatch = category === '全部' || album.category === category;
        const q = query.trim().toLowerCase();
        const searchMatch = !q || album.title.toLowerCase().includes(q) || album.tracks.some((item) => item.title.toLowerCase().includes(q));
        return categoryMatch && searchMatch;
    });
    const searchTracks = query.trim() ? allAudioTracks.filter((item) => {
        const categoryMatch = category === '全部' || item.category === category;
        return categoryMatch && `${item.title} ${item.album}`.toLowerCase().includes(query.trim().toLowerCase());
    }) : [];
    const playTrack = (nextTrack: AudioTrack) => setAudio({ lingma_audio_track: nextTrack.id, lingma_audio_playing: true });
    const shiftTrack = (direction: number) => {
        const index = allAudioTracks.findIndex((item) => item.id === track.id);
        const next = allAudioTracks[(index + direction + allAudioTracks.length) % allAudioTracks.length];
        playTrack(next);
    };
    useEffect(() => {
        const element = audioRef.current;
        if (!element) return;
        const currentSource = element.getAttribute('src');
        if (track.url) {
            if (currentSource !== track.url) {
                element.src = track.url;
                element.load();
            }
        } else if (currentSource) {
            element.removeAttribute('src');
            element.load();
        }
        if (track.url && playing) {
            void element.play().catch(() => undefined);
        } else {
            element.pause();
        }
    }, [track.id, track.url, playing]);
    return (
        <main className="lingma-audio-page">
            <MiniProgramChrome title="贝瓦音乐" onBack={goHome} />
            <section className="lingma-audio-hero">
                <div><span className="lingma-audio-eyebrow">陪伴时光</span><h2>今天想听点什么？</h2><p>从儿歌、故事到国学，让每一次播放都变成亲子时光。</p></div>
                <AlbumCover tone="mint" variant="featured" icon={<Headphones size={32} />} />
            </section>
            <label className="lingma-audio-search"><Search size={19} /><input value={query} onChange={(event) => setAudio({ lingma_audio_query: event.target.value })} placeholder="搜索歌曲或专辑" /><kbd>⌘ K</kbd></label>
            <div className="lingma-audio-category-row" aria-label="音频分类筛选">
                <Filter size={17} />
                {audioCategories.map((item) => <button key={item} type="button" className={category === item ? 'is-active' : ''} onClick={() => setAudio({ lingma_audio_category: item })}>{item}</button>)}
            </div>
            {query.trim() ? <section className="lingma-audio-section"><div className="lingma-audio-section-heading"><h3>搜索结果</h3><span>{searchTracks.length} 首</span></div>{searchTracks.length ? <div className="lingma-audio-track-list">{searchTracks.map((item) => <AudioTrackRow key={item.id} track={item} playing={playing && track.id === item.id} onPlay={() => playTrack(item)} />)}</div> : <div className="lingma-audio-empty"><Search size={30} /><strong>没有找到相关音频</strong><span>试试搜索“春天”或“贝瓦儿歌”</span></div>}</section> : <>
                <section className="lingma-audio-section"><div className="lingma-audio-section-heading"><h3>为你推荐</h3><button type="button" onClick={() => setAudio({ lingma_audio_category: '全部' })}>查看全部 <ChevronRight size={16} /></button></div><div className="lingma-album-grid">{visibleAlbums.slice(0, 4).map((album) => <button className="lingma-album-card" key={album.id} type="button" onClick={() => goAlbum(album.id)}><AlbumCover tone={album.tone} variant={album.id} /><strong>{album.title}</strong><small>{album.category} · {album.count} 首</small></button>)}</div></section>
                <section className="lingma-audio-section"><div className="lingma-audio-section-heading"><h3>全部专辑</h3><span>{visibleAlbums.length} 张</span></div><div className="lingma-audio-album-list">{visibleAlbums.map((album) => <button className={`lingma-audio-album-row ${album.id === 'beiwa-selected' ? 'is-compact' : ''}`} key={album.id} type="button" onClick={() => goAlbum(album.id)}><AlbumCover tone={album.tone} variant={album.id} icon={<ListMusic size={album.id === 'beiwa-selected' ? 18 : 23} />} /><span><strong>{album.title}</strong><small>{album.category} · {album.count} 首</small></span><ChevronRight size={19} /></button>)}</div></section>
            </>}
            <audio ref={audioRef} preload="none" aria-hidden="true" />
            <AudioMiniPlayer track={track} playing={playing} onToggle={() => setAudio({ lingma_audio_playing: !playing })} onBack={() => shiftTrack(-1)} onForward={() => shiftTrack(1)} />
        </main>
    );
}

function AudioTrackRow({ track, playing, onPlay }: { track: AudioTrack; playing: boolean; onPlay: () => void }) {
    return <button className={`lingma-audio-track-row ${playing ? 'is-playing' : ''}`} type="button" onClick={onPlay}><span className="lingma-audio-track-index">{playing ? <Volume2 size={18} /> : <Play size={16} fill="currentColor" />}</span><span className="lingma-audio-track-copy"><strong>{track.title}</strong><small>{track.album}</small></span><time>{track.duration}</time>{playing && <i>播放中</i>}</button>;
}

function AlbumPage({ albumId, goBack }: { albumId?: string; goBack: () => void }) {
    const protoState = useProtoDevState<LingmaProtoState>();
    const audioRef = useRef<HTMLAudioElement>(null);
    const album = getAudioAlbum(albumId);
    const track = getAudioTrack(protoState.lingma_audio_track);
    const playing = protoState.lingma_audio_playing === true;
    const playTrack = (nextTrack: AudioTrack) => setProtoDevState({ lingma_audio_track: nextTrack.id, lingma_audio_playing: true });
    const shiftTrack = (direction: number) => {
        const index = album.tracks.findIndex((item) => item.id === track.id);
        const next = album.tracks[(index + direction + album.tracks.length) % album.tracks.length];
        playTrack(next);
    };
    useEffect(() => {
        const element = audioRef.current;
        if (!element) return;
        const currentSource = element.getAttribute('src');
        if (track.url) {
            if (currentSource !== track.url) {
                element.src = track.url;
                element.load();
            }
        } else if (currentSource) {
            element.removeAttribute('src');
            element.load();
        }
        if (track.url && playing) {
            void element.play().catch(() => undefined);
        } else {
            element.pause();
        }
    }, [track.id, track.url, playing]);
    return <main className="lingma-audio-page lingma-album-page"><MiniProgramChrome title="专辑详情" onBack={goBack} /><section className="lingma-album-hero"><AlbumCover tone={album.tone} variant={album.id} icon={<BookOpen size={36} />} /><div><span>{album.category}</span><h2>{album.title}</h2><p>{album.count} 首音频 · 适合亲子陪伴</p></div></section><button className="lingma-play-all" type="button" onClick={() => playTrack(album.tracks[0])}><Play size={18} fill="currentColor" /> 播放全部</button><section className="lingma-audio-section"><div className="lingma-audio-section-heading"><h3>曲目列表</h3><span>{album.tracks.length} 首示例</span></div><div className="lingma-audio-track-list">{album.tracks.map((item) => <AudioTrackRow key={item.id} track={item} playing={playing && track.id === item.id} onPlay={() => playTrack(item)} />)}</div></section><audio ref={audioRef} preload="none" aria-hidden="true" /><AudioMiniPlayer track={track} playing={playing} onToggle={() => setProtoDevState({ lingma_audio_playing: !playing })} onBack={() => shiftTrack(-1)} onForward={() => shiftTrack(1)} /></main>;
}

function SettingCard({ children, className = '', annotationId }: { children: React.ReactNode; className?: string; annotationId?: string }) {
    return <section className={`lingma-setting-card ${className}`} data-annotation-id={annotationId}>{children}</section>;
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
        <SettingCard annotationId="device-volume">
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
    const protoState = useProtoDevState<LingmaProtoState>();
    const voiceSpeed = rangeValue(protoState.lingma_voice_speed, 3, 1, 5);
    const volume = rangeValue(protoState.lingma_volume, 3, 1, 5);
    const isOn = protoState.lingma_speed_on === true;
    const activeConversation = protoState.lingma_conversation_on !== false;
    const conversationInterval = rangeValue(protoState.lingma_conversation_interval, 30, 10, 60, 10);
    const activeTab = protoState.lingma_settings_tab === 'system' ? 'system' : 'basic';
    const voiceView = protoState.lingma_voice_view;
    const profiles = protoState.lingma_voice_profiles || defaultVoiceProfiles;
    const setVoiceSpeed = (value: number) => setProtoDevState({ lingma_voice_speed: value });
    const setVolume = (value: number) => setProtoDevState({ lingma_volume: value });
    const setConversationInterval = (value: number) => setProtoDevState({ lingma_conversation_interval: value });
    const setActiveTab = (value: 'basic' | 'system') => setProtoDevState({ lingma_settings_tab: value });
    const openVoiceList = () => setProtoDevState({ lingma_voice_view: 'list' });

    if (voiceView === 'list') return <VoiceManagement profiles={profiles} onChange={(next) => setProtoDevState({ lingma_voice_profiles: next })} onBack={() => setProtoDevState({ lingma_voice_view: null })} />;

    return (
        <main className="lingma-device-page">
            <MiniProgramChrome title="设备管理" onBack={goHome} />
            <section className="lingma-device-profile" data-annotation-id="device-profile">
                <img src={deviceAvatar} alt="小乐头像" />
                <div><h2>V5测试的小乐 <Settings2 size={17} /></h2><p>主人昵称：V5测试 <Copy size={16} /></p></div>
                <button type="button" aria-label="切换设备"><ArrowRightLeft size={20} /></button>
            </section>

            <div className="lingma-device-tabs" role="tablist" aria-label="设备设置分类" data-annotation-id="device-tabs">
                <button className={activeTab === 'basic' ? 'is-active' : ''} type="button" role="tab" aria-selected={activeTab === 'basic'} onClick={() => setActiveTab('basic')}>基础设置</button>
                <button className={activeTab === 'system' ? 'is-active' : ''} type="button" role="tab" aria-selected={activeTab === 'system'} onClick={() => setActiveTab('system')}>系统参数</button>
            </div>
            {activeTab === 'basic' && <div role="tabpanel" aria-label="基础设置">
            <SettingCard annotationId="device-power">
                <div className="lingma-setting-title-row">
                    <div className="lingma-setting-label"><Moon size={22} /><strong>小乐正在睡梦中，请开机~</strong></div>
                    <span className="lingma-setting-status"><Power size={20} /> 关灯</span>
                </div>
                <p className="lingma-setting-description compact">已关机</p>
            </SettingCard>
            <SettingCard annotationId="device-network">
                <div className="lingma-setting-title-row">
                    <div className="lingma-setting-label"><Network size={22} /><strong>网络断开</strong></div>
                    <span className="lingma-setting-status"><WifiOff size={20} /> 未连接</span>
                </div>
                <p className="lingma-setting-description compact">网络设置</p>
            </SettingCard>
            <button className="lingma-voice-entry" type="button" onClick={openVoiceList} data-annotation-id="device-voice-management"><span className="lingma-setting-label"><Mic size={22} /><strong>声纹管理</strong></span><span><small>{profiles.length}/10 人</small><ChevronRight size={20} /></span></button>
            <SettingCard className={!activeConversation ? 'is-disabled' : ''} annotationId="device-conversation">
                <div className="lingma-setting-title-row">
                    <div className="lingma-setting-label"><MessageCircle size={22} /><strong>主动对话</strong></div>
                    <button
                        className={`lingma-toggle ${activeConversation ? 'is-on' : ''}`}
                        type="button"
                        onClick={() => setProtoDevState({ lingma_conversation_on: !activeConversation })}
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
            <SettingCard annotationId="device-voice-speed">
                <div className="lingma-setting-title-row">
                    <div className="lingma-setting-label"><Headphones size={22} /><strong>接话速度</strong></div>
                    <button className={`lingma-toggle ${isOn ? 'is-on' : ''}`} type="button" onClick={() => setProtoDevState({ lingma_speed_on: !isOn })} aria-label="切换接话速度开关" aria-pressed={isOn}><span /></button>
                </div>
                <p className="lingma-setting-description">接话速度越快小乐会越积极回应您，但可能会导致您的说话被打断，请根据您的体验选择速度。</p>
                <input className="lingma-range" type="range" min={1} max={5} value={voiceSpeed} onChange={(event) => setVoiceSpeed(Number(event.target.value))} aria-label="接话速度" />
                <div className="lingma-range-labels"><span>很慢</span><span>慢</span><span>正常</span><span>快</span><span>很快</span></div>
            </SettingCard>
            <RangeControl label="音量" minLabel="哄睡" maxLabel="响亮" value={volume} onChange={setVolume} />
            </div>}

            {activeTab === 'system' && <div role="tabpanel" aria-label="系统参数">
            <SettingCard className="lingma-parameter-card" annotationId="device-system-parameters">
                <div className="lingma-parameter-row"><span>设备 ID</span><strong>14:c1:9f:d6:e7:84 <Copy size={17} /></strong></div>
                <p>反馈问题时，平台客服可能会需要该ID进行问题定位</p>
                <div className="lingma-parameter-row"><span>当前版本</span><strong>1.1.5</strong></div>
                <div className="lingma-parameter-row"><span>陪伴时长</span><strong>39天</strong></div>
                <button className="lingma-unbind-row" type="button" data-annotation-id="device-unbind"><span>解除绑定</span><ArrowRightLeft size={18} /></button>
            </SettingCard>
            </div>}
        </main>
    );
}

export default function LingmaPlanet() {
    const { page, setPage } = useHashPage(route);
    const protoState = useProtoDevState<LingmaProtoState>();
    const currentPageId = page === 'device'
        ? (protoState.lingma_settings_tab === 'system' ? 'device-system' : 'device-basic')
        : page === 'audio' ? 'audio'
            : page === 'album' ? 'album'
                : 'home';
    const viewerOptions = useMemo<AnnotationViewerOptions>(() => ({
        currentPageId,
        showToolbar: true,
        showThemeToggle: true,
        showColorFilter: true,
        emptyWhenNoData: false,
        toolbarEdge: 'right',
        onDirectoryRoute: (node) => {
            if (node.route !== 'home' && node.route !== 'device' && node.route !== 'audio' && node.route !== 'album') return;
            const payload = node.payload as Partial<LingmaProtoState> | undefined;
            if (payload) setProtoDevState(payload);
            setPage(node.route);
        },
    }), [currentPageId, setPage]);
    return <>
        {page === 'device'
            ? <DevicePage goHome={() => setPage('home')} />
            : page === 'audio'
                ? <AudioPage goHome={() => setPage('home')} goAlbum={(albumId) => { setProtoDevState({ lingma_audio_album: albumId }); setPage('album'); }} />
                : page === 'album'
                    ? <AlbumPage albumId={protoState.lingma_audio_album} goBack={() => setPage('audio')} />
                    : <HomePage goToDevice={() => setPage('device')} goToAudio={() => setPage('audio')} />}
        <AnnotationViewer source={annotationSourceDocument as AnnotationSourceDocument} options={viewerOptions} />
    </>;
}
